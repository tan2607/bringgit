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
        name: 'Development Login',
        credentials: {
          email: { label: "Email", type: "email", placeholder: "dev@keyreply.com", value: "dev@keyreply.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          return {
              id: 'dev-user-id',
              email: "dev@keyreply.com",
              name: 'Development User',
              emailVerified: new Date(),
          }
        }
      })
    ] : []),
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
  }
}

export default NuxtAuthHandler(authConfig, runtimeConfig)