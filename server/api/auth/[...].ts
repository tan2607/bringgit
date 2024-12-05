import MicrosoftEntraID from '@auth/core/providers/microsoft-entra-id'
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
  ],
  callbacks: {
    async signIn({ user }) {
      const emailDomain = user.email?.split('@')[1]
      if (emailDomain === 'keyreply.com') {
        return true
      } else {
        return false
      }
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
    signIn: '/auth/login'
  }
}

export default NuxtAuthHandler(authConfig, runtimeConfig)