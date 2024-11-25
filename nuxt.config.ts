// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxthub/core',
    '@nuxtjs/i18n',
    '@vueuse/motion/nuxt',
    '@hebilicious/authjs-nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/mdc'
  ],
  hub: {
    database: true
  },
  content: {
    // Content module configuration
    documentDriven: true,
    highlight: {
      theme: 'github-dark'
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3
      }
    }
  },
  i18n: {
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'ar', file: 'ar.ts', name: 'العربية', dir: 'rtl' },
      { code: 'en', file: 'en.ts', name: 'English' },
      { code: 'id', file: 'id.ts', name: 'Bahasa Indonesia' },
      { code: 'ja', file: 'ja.ts', name: '日本語' },
      { code: 'ko', file: 'ko.ts', name: '한국어' },
      { code: 'ms', file: 'ms.ts', name: 'Bahasa Melayu' },
      { code: 'th', file: 'th.ts', name: 'ไทย' },
      { code: 'zh_hans', file: 'zh_hans.ts', name: '简体中文' },
      { code: 'zh_hant', file: 'zh_hant.ts', name: '繁體中文' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  ssr: false,
  // debug: true,
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare_pages',
    compatibilityDate: '2024-09-02',
    experimental: {
      openAPI: true,
    },
    openAPI: {
      meta: {
        title: 'KeyReply Voice AI',
        description: 'KeyReply Voice AI API endpoints',
        version: '1.0',
      },
      ui: {
        scalar: {
          route: "/dev",
          "guides": [
            {
              "name": "Voice AI",
              "sidebar": [
                {
                  "path": "content/docs/api/voice.md",
                  "type": "page"
                }
              ]
            }
          ],
        },
      }
    }
  },
  runtimeConfig: {
    vapiApiKey: process.env.VAPI_API_KEY,
    authJs: {
      secret: process.env.NEXTAUTH_SECRET,
    },
    public: {
      authJs: {
        baseUrl: "https://next.keyreply.com",
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