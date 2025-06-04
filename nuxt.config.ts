// https://nuxt.com/docs/api/configuration/nuxt-config
const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || process.env.CF_PAGES_URL || "http://localhost:3000"

export default defineNuxtConfig({
  compatibilityDate: '2025-04-25',
  compatibilityFlags: [
    "nodejs_compat"
  ],
  debug: false,
  icon: {
    serverBundle: 'remote'
  },
  runtimeConfig: {
    apiToken: process.env.API_TOKEN,
    vapiSecret: process.env.VAPI_SECRET_TOKEN,
    // Auth0 Configuration
    auth0: {
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE
    },
    providers: {
      // Configure which providers to load on server start
      enabled: (process.env.ENABLED_PROVIDERS || 'vapi,openai,whisper,sendgrid,cartesia,playai,perplexity,brightree,ringcentral,twilio,firecrawl,gemini').split(','),
    },
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
    demoApiKey: process.env.DEMO_API_KEY,
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,
    // Brightree API configuration
    brightree: {
      username: process.env.BRIGHTREE_USERNAME,
      password: process.env.BRIGHTREE_PASSWORD
    },
    // RingCentral API credentials
    ringcentral: {
      clientId: process.env.RINGCENTRAL_CLIENT_ID,
      clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
      serverUrl: process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com',
      jwt: process.env.RINGCENTRAL_JWT
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    },
    authJs: {
      secret: process.env.NEXTAUTH_SECRET,
    },
    accountId: process.env.ACCOUNT_ID,
    public: {
      baseUrl,
      vapiPublicKey: process.env.VAPI_PUBLIC_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      authJs: {
        baseUrl,
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
    '@nuxtjs/mdc',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@formkit/nuxt',
    '@pinia/nuxt'
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
    bundle: {
      optimizeTranslationDirective: false,
    },
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
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    scheduledTasks: {
    },
    preset: 'cloudflare_pages',
    compatibilityDate: '2025-06-04',
    compatibilityFlags: [
      "nodejs_compat"
    ],
    experimental: {
      openAPI: true,
      tasks: true,
      database: true
    },
    database: {
      default: {
        connector: 'sqlite',
        options: { name: 'claims' }
      },
    },
    openAPI: {
      meta: {
        title: 'KeyReply',
        description: 'KeyReply AI API endpoints',
        version: '1.1',
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