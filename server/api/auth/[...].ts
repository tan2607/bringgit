import MicrosoftEntraID from '@auth/core/providers/microsoft-entra-id'
import Auth0Provider from '@auth/core/providers/auth0'
import Google from '@auth/core/providers/google'
import type { AuthConfig } from "@auth/core/types"
import { NuxtAuthHandler } from '#auth'
import Credentials from '@auth/core/providers/credentials'

const runtimeConfig = useRuntimeConfig()
const isDevelopment = process.env.NODE_ENV === 'development'

const authConfig: AuthConfig = {
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
    ...(isDevelopment ? [
      Credentials({
        name: 'credentials',
        credentials: {
          email: { label: "Email", type: "email", placeholder: "dev@keyreply.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null

          if (credentials.email === 'dev@keyreply.com' && 
              credentials.password === 'password') {
            return {
              id: 'dev-user-id',
              email: credentials.email,
              name: 'Development User',
              emailVerified: new Date()
            }
          }
          return null
        }
      })
    ] : []),
    // Microsoft Entra ID provider
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: process.env.AUTH_MICROSOFT_ENTRA_ID_AUTHORIZATION,
      token: process.env.AUTH_MICROSOFT_ENTRA_ID_TOKEN,
      userinfo: process.env.AUTH_MICROSOFT_ENTRA_ID_USERINFO,
    }),
    // Auth0 provider
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
      authorization: {
        params: {
          prompt: "login"
        }
      }
    }),
    // Google Workspace provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // Forces Google to show the account selection screen every time
          access_type: "offline", // Allows app to refresh the access token without user intervention
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Microsoft Entra ID, only allow keyreply.com domain
      if (account?.provider === 'microsoft-entra-id') {
        const emailDomain = user.email?.split('@')[1]
        return emailDomain === 'keyreply.com'
      }
      
      // For Auth0, allow any verified email
      if (account?.provider === 'auth0') {
        return !!user.email
      }

      // For Google, check allowed domains from environment variable
      if (account?.provider === 'google') {
        if (!user.email) {
          console.warn('Google login rejected: No email provided. User: ' + user)
          return false
        }
        
        const emailDomain = user.email.split('@')[1]
        if (!emailDomain) {
          console.warn('Google login rejected: Invalid email format: ' + user.email)
          return false
        }

        const domainsStr = process.env.ALLOWED_GOOGLE_DOMAINS || 'keyreply.com'
        const allowedDomains = domainsStr.split(',').map(domain => domain.trim().toLowerCase())
        return allowedDomains.includes(emailDomain.toLowerCase())
      }

      // For development credentials
      if (account?.provider === 'credentials') {
        return true
      }

      return false
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