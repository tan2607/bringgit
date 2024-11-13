import MicrosoftEntraID from '@auth/core/providers/microsoft-entra-id'
import type { AuthConfig } from "@auth/core/types"
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()
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
    }
  }
}

export default NuxtAuthHandler(authConfig, runtimeConfig)