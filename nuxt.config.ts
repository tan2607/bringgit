// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: [
    '@nuxt/ui',
    '@vueuse/motion/nuxt',
    '@pinia/nuxt',
    '@hebilicious/authjs-nuxt'
  ],
  ssr: false,
  // debug: true,
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare_pages'
  },
  runtimeConfig: {
    vapiApiKey: process.env.VAPI_API_KEY,
    authJs: {
      secret: process.env.NEXTAUTH_SECRET,
    },
    public: {
      authJs: {
        baseUrl: "/api/auth",
        guestRedirectTo: "/auth/login",
        authenticatedRedirectTo: "/analytics",
        verifyClientOnEveryRequest: true,
      },
      motion: {
        directives: {
          'pop-bottom': {
            initial: {
              scale: 0,
              opacity: 0,
              y: 100,
            },
            visible: {
              scale: 1,
              opacity: 1,
              y: 0,
            }
          }
        }
      }
    }
  },
  alias: {
    "process/": "process",
    cookie: "cookie",
  }
})