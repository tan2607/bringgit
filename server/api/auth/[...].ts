import MicrosoftEntraID from '@auth/core/providers/microsoft-entra-id'
import type { AuthConfig } from "@auth/core/types"
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()
const authConfig:AuthConfig = {
  secret: runtimeConfig.authJs.secret,
  jwt: {
    encode: ({ secret, token }) => {
      return JSON.stringify(token)
    },
    decode: async ({ secret, token }) => {
      return JSON.parse(token!)
    }
  },
  basePath: runtimeConfig.public.authJs.baseUrl,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      userinfo: "https://graph.microsoft.com/oidc/userinfo"
    }),
  ]
}

export default NuxtAuthHandler(authConfig, runtimeConfig)