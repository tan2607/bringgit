import Auth0Provider from '@auth/core/providers/auth0'
import type { AuthConfig } from "@auth/core/types"
import { NuxtAuthHandler } from '#auth'

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
    async signIn({ user }) {
      // For Auth0, allow any verified email
      return !!user.email
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  }
}

export default NuxtAuthHandler(authConfig, runtimeConfig)