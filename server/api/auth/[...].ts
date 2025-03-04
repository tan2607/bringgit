import Auth0Provider from '@auth/core/providers/auth0'
import type { AuthConfig } from "@auth/core/types"
import { NuxtAuthHandler } from '#auth'
import { auth0Management } from '@/lib/auth0'
import { AppMetadata, DEFAULT_APP_METADATA } from '@/types/auth'
import { domainUtils } from '@/lib/domain'

const runtimeConfig = useRuntimeConfig()

const authConfig: AuthConfig = {
  logger: {
    error(code, ...message) {
      console.error('[AUTH] Error. Runtime Config:', {
        baseUrl: runtimeConfig.public.baseUrl,
        authJs: runtimeConfig.public.authJs
      })
      console.error(code, ...message)
    }
  },
  secret: runtimeConfig.authJs.secret,
  jwt: {
    encode: ({ secret, token }) => {
      return JSON.stringify(token)
    },
    decode: async ({ secret, token }) => {
      return JSON.parse(token!)
    }
  },
  basePath: "/api/auth",
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
      authorization: {
        params: {
          prompt: "login"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false
        
        // Get user metadata to check permissions
        const userId = account?.providerAccountId
        if (!userId) {
          console.error("Provider Account ID not found")
          return false
        }
        const metadata = await auth0Management.getUserMetadata(userId)
        
        // Get the current hostname from runtime config
        const baseUrl = runtimeConfig.public.baseUrl
        if (!baseUrl) {
          console.error('Base URL is not configured')
          return false
        }

        return domainUtils.canAccessDomain(baseUrl, metadata.permissions)
      } catch (error) {
        console.error('Sign in validation error:', error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (account?.providerAccountId) {
          token.auth0Id = account.providerAccountId
          const metadata = await auth0Management.getUserMetadata(account.providerAccountId)
          token.app_metadata = metadata
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error, {
          token, 
          user, 
          account: account?.providerAccountId
        })
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.auth0Id = token.auth0Id as string
          session.user.app_metadata = (token.app_metadata as AppMetadata) || DEFAULT_APP_METADATA
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error, {session, token})
        return {
          ...session,
          error: 'Failed to load user data'
        }
      }
    }
  },
  pages: {
    signIn: '/auth/login',
  }
}

export const authOptions = authConfig

export default NuxtAuthHandler(authConfig, runtimeConfig)