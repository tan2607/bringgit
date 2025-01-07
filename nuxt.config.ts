// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  debug: false,
  icon: {
    serverBundle: 'remote'
  },
  runtimeConfig: {
    apiToken: process.env.API_TOKEN,
    vapiSecret: process.env.VAPI_SECRET_TOKEN,
    // Provider API Keys
    openaiApiKey: process.env.OPENAI_API_KEY,
    vapiApiKey: process.env.VAPI_API_KEY,
    cartesiaApiKey: process.env.CARTESIA_API_KEY,
    copilotApiKey: process.env.OPENAI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    playaiApiKey: process.env.PLAYAI_API_KEY,
    playaiUserId: process.env.PLAYAI_USER_ID,
    whisperApiKey: process.env.GROQ_API_KEY,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    },
    authJs: {
      secret: process.env.NEXTAUTH_SECRET,
    },
    public: {
      googleApiKey: process.env.GOOGLE_API_KEY,
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
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
  vite: {
    resolve: {
      alias: {
        "electron/index.js": 'mocks/electron.js',
      },
    },
    optimizeDeps: {
      include: ['debug']
    },
    css: {
      transformer: 'lightningcss'
    },
    build: {
      commonjsOptions: {
        include: [/debug/, /node_modules/]
      }
    }
  },
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxthub/core',
    '@nuxtjs/i18n',
    '@vueuse/motion/nuxt',
    '@hebilicious/authjs-nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/mdc',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@formkit/nuxt'
  ],
  hub: {
    database: true
  },
  formkit: {
    // Experimental support for auto loading (see note):
    autoImport: true
  },
  content: {
    // Content module configuration
    database: {
      type: 'd1',
      binding: 'DB'
    },
    // build: {
    //   markdown: {
    //     toc: {
    //       depth: 3,
    //       searchDepth: 3
    //     }
    //   }
    // }
  },
  i18n: {
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', file: 'en.ts', name: 'English' },
      { code: 'zh_hans', file: 'zh_hans.ts', name: '简体中文' },
      { code: 'zh_hant', file: 'zh_hant.ts', name: '繁體中文' },
      { code: 'ja', file: 'ja.ts', name: '日本語' },
      { code: 'ko', file: 'ko.ts', name: '한국어' },
      { code: 'ar', file: 'ar.ts', name: 'العربية', dir: 'rtl' },
      { code: 'id', file: 'id.ts', name: 'Bahasa Indonesia' },
      { code: 'vi', file: 'vi.ts', name: 'Tiếng Việt' },
      { code: 'ms', file: 'ms.ts', name: 'Bahasa Melayu' },
      { code: 'th', file: 'th.ts', name: 'ไทย' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  ssr: false,
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
      },
    },
  },
  alias: {
    "process/": "process",
    cookie: "cookie",
  }
})