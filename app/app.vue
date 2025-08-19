<style>
@import "tailwindcss";
@import "@nuxt/ui-pro";

a[aria-label="Nuxt UI Pro"] {
  display: none;
}

@theme {
  --font-sans: 'Public Sans', sans-serif;
  --breakpoint-3xl: 1920px;
  --color-primary: #1c57d9;

  --color-primary: var(--ui-color-primary-500);
  --color-secondary: var(--ui-color-secondary-500);
  --color-success: var(--ui-color-success-500);
  --color-info: var(--ui-color-info-500);
  --color-warning: var(--ui-color-warning-500);
  --color-error: var(--ui-color-error-500);
}
</style>

<script setup lang="ts">
import { availableLocales, getLocaleIcon } from '@@/i18n/config'
import { useSettingStore } from '~~/stores/useSettingStore'
import { useUser } from '@/composables/useUser'

// Apply auth middleware to all routes
definePageMeta({
  middleware: ['access-control']
})

const { locale, locales, setLocale, t } = useI18n()
const { status, signOut, session } = useAuth()
const { isAdmin, user } = useUser()
const switchLocalePath = useSwitchLocalePath()
const localeRoute = useLocaleRoute()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

// Available locales for the dropdown
const availableLocaleItems = computed(() =>
  (locales.value || []).map(l => ({
    label: l.name,
    icon: getLocaleIcon(l.code),
    onSelect: () => setLocale(l.code),
    selected: l.code === locale.value
  }))
)

const settingStore = useSettingStore();

// Locale dropdown
const localeDropdown = computed(() => {
  const currentLocale = locales.value?.find(l => l.code === locale.value)
  return {
    key: null,
    label: currentLocale?.name || t('language'),
    icon: getLocaleIcon(currentLocale?.code || 'en'),
    children: availableLocaleItems.value
  }
})

// Navigation items
const moduleSettings = ref<any[]>([]);
const postCallSettings = ref<any>({});

// Base items that all users can access
const baseItems = computed(() => [
      {
        key: 'calls',
        label: t('calls'),
        icon: 'i-lucide-phone',
        description: t('manage-calls'),
        to: localeRoute('/calls')?.path
      }
])

// Admin-only items
const adminItems = computed(() => [
  {
    key: null,
    label: t('home'),
    icon: 'i-lucide-home',
    to: localeRoute('/')?.path
  },  
  {
    key: 'assistants',
    label: t('assistants'),
    icon: 'i-lucide-bot',
    description: t('manage-assistants'),
    to: localeRoute('/assistants')?.path
  },
  {
    key: 'analytics',
    label: t('analytics'),
    icon: 'i-lucide-line-chart',
    description: t('review-statistics'),
    to: localeRoute('/analytics')?.path
  },
  {
    key: 'scheduling',
    label: t('scheduling'),
    icon: 'i-lucide-calendar',
    description: t('manage-schedule'),
    children: [
      {
        key: 'scheduling-jobs',
        label: t('jobs'),
        icon: 'i-lucide-briefcase',
        description: t('view-schedule'),
        to: localeRoute('/scheduling/jobs')?.path
      },
      {
        key: 'scheduling-jobs',
        label: t('schedule-job'),
        icon: 'i-lucide-calendar',
        description: t('schedule-job-description'),
        to: localeRoute('/scheduling')?.path
      },
      {
        key: 'scheduling-reports',
        label: t('reports'),
        icon: 'i-lucide-bar-chart',
        description: t('view-job-reports'),
        to: localeRoute('/scheduling/reports')?.path
      },
      {
        key: 'scheduling-settings',
        label: t('settings'),
        icon: 'i-lucide-settings',
        description: t('configure-scheduling-settings'),
        to: localeRoute('/scheduling/settings')?.path
      }
    ]
  },
  {
    key: 'phone-numbers',
    label: t('phoneNumbers'),
    icon: 'i-lucide-phone',
    description: t('manage-phone-numbers'),
    to: localeRoute('/numbers')?.path
  },
  {
    key: 'demo',
    label: t('demos'),
    icon: 'i-lucide-layout-template',
    description: t('view-demo'),
    children: [
      {
        key: 'demo-medication',
        label: 'Medication Assistant',
        icon: 'i-lucide-languages',
        description: 'Get medication information and side effects',
        to: localeRoute('/demo/medication')?.path
      },
      {
        key: 'demo-translation',
        label: t('translation-demo'),
        icon: 'i-lucide-languages',
        description: t('translation-demo-description'),
        to: localeRoute('/demo/translation')?.path
      },
      {
        key: 'demo-patient-intake',
        label: t('patient-intake-demo'),
        icon: 'i-lucide-clipboard-list',
        description: t('patient-intake-demo-description'),
        to: localeRoute('/demo/patient-intake-form')?.path
      },
      {
        key: 'demo-sms',
        label: t('sms-demo'),
        icon: 'i-lucide-message-square',
        description: t('sms-demo-description'),
        to: localeRoute('/demo/sms')?.path
      },
      {
        key: 'demo-location-search',
        label: t('location-search-demo'),
        icon: 'i-lucide-map-pin',
        description: t('location-search-demo-description'),
        to: localeRoute('/demo/location')?.path
      },
      {
        key: 'demo-ocr',
        label: t('ocr-demo'),
        icon: 'i-lucide-file-scan',
        to: localeRoute('/ocr')?.path
      },
      {
        key: 'demo-rpa',
        label: t('rpa-demo'),
        icon: 'i-lucide-cpu',
        description: t('rpa-demo-description'),
        to: localeRoute('/demo/rpa')?.path
      },
      {
        key: 'demo-workflow',
        label: t('workflow-demo'),
        icon: 'i-lucide-workflow',
        description: t('workflow-demo-description'),
        to: localeRoute('/demo/workflow')?.path
      },
      {
        key: 'demo-report-assistant',
        label: t('report-assistant'),
        icon: 'i-lucide-table',
        description: t('report-assistant-description'),
        to: localeRoute('/demo/report-assistant')?.path
      },
      {
        key: 'demo-medication',
        label: 'Medication Assistant',
        icon: 'i-lucide-table',
        description: 'Get medication information and side effects',
        to: localeRoute('/demo/medication')?.path
      },
      {
        key: 'demo-claims-assistant',
        label: t('claims-assistant'),
        icon: 'i-lucide-table',
        description: t('claims-assistant-description'),
        to: localeRoute('/demo/claims-assistant')?.path
      },
      {
        key: 'demo-call',
        label: t('call-demo'),
        icon: 'i-lucide-phone-call',
        description: t('call-demo-description'),
        children: [
          {
            key: 'demo-call-ringcentral',
            label: t('ringcentral-demo'),
            icon: 'i-lucide-phone',
            description: t('ringcentral-demo-description'),
            to: localeRoute('/demo/ringcentral')?.path
          },
          {
            key: 'demo-call-webcall',
            label: t('webcall-demo'),
            icon: 'i-lucide-file-scan',
            description: t('webcall-demo-description'),
            to: localeRoute('/demo/webcall')?.path
          }
        ]
      },
      {
        key: 'demo-company-research',
        label: t('company-research'),
        icon: 'i-lucide-brain',
        description: t('company-research-description'),
        to: localeRoute('/demo/company-research')?.path
      },
    ]
  },
  {
    label: t('support'),
    icon: 'i-lucide-help-circle',
    children: [
      {
        key: 'support-help-center',
        label: t('help-center'),
        icon: 'i-lucide-life-buoy',
        description: t('get-help'),
        to: localeRoute('/help')?.path
      },
      {
        key: 'support-settings',
        label: t('settings'),
        icon: 'i-lucide-settings',
        description: t('configure-preferences'),
        to: localeRoute('/settings')?.path
      },
      {
        key: 'support-view-api',
        label: t('view-api'),
        icon: 'i-lucide-file-json',
        to: localeRoute('/dev')?.path
      }
    ]
  },
  {
    key: 'access-control',
    label: t('access-control.title'),
    icon: 'i-lucide-lock',
    to: localeRoute('/access-control')?.path
  }
])

// Profile menu items
const profileMenu = computed(() => ({
  key: null,
  label: user.value?.name || t('profile'),
  icon: user.value ? 'i-lucide-user' : 'i-lucide-key',
  children: user.value ? [
    {
      key: null,
      label: user.value.email,
      icon: 'i-lucide-mail',
      disabled: true,
      class: "cursor-pointer min-w-[max-content]"
    },
    {
        key: null,
        label: t('settings'),
        icon: 'i-lucide-settings',
        to: localeRoute('/settings')?.path,
        class: "cursor-pointer"
    },
    {
      key: null,
      label: t('logout'),
      icon: 'i-lucide-log-out',
      description: t('sign-out'),
      onSelect: () => signOut({ redirect: true, callbackUrl: '/auth/login' }),
      class: "cursor-pointer",
    }
  ] : [
    {
      key: null,
      label: t('login'),
      icon: 'i-lucide-log-in',
      description: t('sign-in'),
      to: localeRoute('/auth/login')?.path
    }
  ]
}))

// Combine items based on user role
const items = computed(() => {
  if (isAdmin.value && adminItems.value.length > 0) {
    const firstAdminItem = adminItems.value[0];
    const remainingAdminItems = adminItems.value.slice(1);
    return [
      firstAdminItem,
      ...baseItems.value,
      ...remainingAdminItems,
      profileMenu.value,
      localeDropdown.value,
      {
        key: null,
        slot: 'color-mode',
      }
    ];
  }
  
  return [
    ...baseItems.value,
    profileMenu.value, 
    localeDropdown.value,
    {
      key: null,
      slot: 'color-mode',
    }
  ];
})

// Filter items based on module settings
const filteredItems = computed(() => items.value.reduce((acc: any[], item) => {
  if (moduleSettings.value.length === 0 || !item.key) {
    return [...acc, item];
  }

  const mdl = moduleSettings.value.find((m: any) => m.key == item.key)
  if (!mdl || !mdl.enable) {
    return acc;
  }
  if (!item.children || !mdl.sub) {
    return [...acc, item];
  }

  const filteredChildren = item.children.filter(child => {
    const sub = mdl.sub?.find((s: any) => s.key == child.key)
    return sub && sub.enable
  })

// if no child is enabled, no need to return the item;
  if (filteredChildren.length > 0) {
    const newItem = { ...item, children: filteredChildren } as any;
    return [...acc, newItem];
  }

  return acc
}, []))
async function fetchModuleSettings() {
  const response = await fetch('/api/settings/module');
  const data = await response.json();

  if (data.success) {
    moduleSettings.value = data.modules;
  } else {
    moduleSettings.value = [];
  }

  settingStore.finishReload()
}

async function fetchPostCallSettings() {
  const response = await fetch('/api/settings/postCall');
  const data = await response.json();

  if (data.success) {
    postCallSettings.value = data.postCallSettings;
  } else {
    postCallSettings.value = {};
  }
}

watch(() => settingStore.reload, (newValue, oldValue) => {
  if (newValue) {
    fetchModuleSettings();
    fetchPostCallSettings();
  }
});

onMounted(() => {
  const browserLocale = locale.value;
  const supportedLocales = ['ar', 'en', 'id', 'vi', 'ja', 'ko', 'ms', 'th', 'zh_hans', 'zh_hant']
  const baseLocale = browserLocale.split('-')[0]
  
  // Special case for Chinese
  if (browserLocale.startsWith('zh')) {
    locale.value = browserLocale.includes('hant') ? 'zh_hant' : 'zh_hans'
  } else if (baseLocale && supportedLocales.includes(baseLocale)) {
    // For other languages, use the base language code
    locale.value = baseLocale
  }

  fetchModuleSettings()
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  },
  title: 'KeyReply Voice'
})
</script>

<template>
  <UApp :locale="locales[locale as string]">
    <template v-if="!$route.path.startsWith('/auth')">
      <UHeader class="w-full">
        <template #left>
          
        </template>
        <template #right>
          <UColorModeButton />
        </template>
        <UNavigationMenu orientation="horizontal" variant="pill" arrow highlight :items="filteredItems" class="z-50" :ui="{
          viewport: 'w-full min-w-[800px] max-w-full cursor-pointer',
        }">
        </UNavigationMenu>
      </UHeader>
    </template>
    
    <NuxtLoadingIndicator />
    <UMain>
      <NuxtLayout>
        <NuxtPage :transition="{
          name: 'page',
          mode: 'out-in'
        }" />
      </NuxtLayout>
    </UMain>

    <UFooter/>

    <ConfirmDialog />
  </UApp>
</template>