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
import { availableLocales, getLocaleIcon } from '~/i18n/config'
import { useSettingStore } from '~/stores/useSettingStore';

const { locale, locales, setLocale, t } = useI18n()
const { status, signOut, session } = useAuth()
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
const filteredItems = ref<any[]>([]);

const items = computed(() => [
  {
    key: null,
    label: t('home'),
    icon: 'i-lucide-home',
    to: localeRoute('/')?.path
  },
  {
    key: 'calls',
    label: t('calls'),
    icon: 'i-lucide-phone',
    description: t('manage-calls'),
    to: localeRoute('/calls')?.path
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
        to: localeRoute('/ocr')
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
        key: 'demo-claims-assistant',
        label: t('claims-assistant'),
        icon: 'i-lucide-table',
        description: t('claims-assistant-description'),
        to: localeRoute('/demo/claims-assistant')?.path
      }
    ]
  },
  {
    key: 'support',
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
  // Profile/Auth menu
  {
    key: null,
    label: session.value?.user?.name || t('profile'),
    icon: session.value?.user ? 'i-lucide-user' : 'i-lucide-key',
    children: session.value?.user ? [
      {
        key: null,
        label: session.value.user.email,
        icon: 'i-lucide-mail',
        disabled: true
      },
      {
        key: null,
        label: t('settings'),
        icon: 'i-lucide-settings',
        to: localeRoute('/settings')?.path
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
  },
  localeDropdown.value,
  {
    key: null,
    slot: 'color-mode',
  }
])

async function setHeaderMenu() {
  const response = await fetch('/api/settings/module');
  const data = await response.json();

  filteredItems.value = [];
  if (data.success) {
    const modules = data.modules;

    items.value.forEach(item => {
      if (item.key) {
        const mdl = modules.find((m: any) => m.key == item.key)
        if (mdl && mdl.enable) {
          if (item.children && mdl.sub) {
            const filteredChildren = item.children.filter(child => {
              const sub = mdl.sub.find((s: any) => s.key == child.key)
              return sub && sub.enable
            })

            if (filteredChildren.length > 0) {
              filteredItems.value.push({ ...item, children: filteredChildren })
            }
          } else {
            filteredItems.value.push(item)
          }
        }
      } else {
        filteredItems.value.push(item);
      }
    })
  } else {
    items.value.forEach(item => {
      filteredItems.value.push(item);
    })
  }

  settingStore.finishReload()
}

watch(() => settingStore.reload, (newValue, oldValue) => {
  if (newValue) {
    setHeaderMenu();
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

  setHeaderMenu()
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
  }
})
</script>

<template>
  <UApp :locale="locales[locale as string]">
    <template v-if="!$route.path.startsWith('/auth')">
      <UHeader>
        <template #left></template>
        <template #right>
          <UColorModeButton />
        </template>
        <UNavigationMenu orientation="horizontal" variant="pill" arrow highlight :items="filteredItems" class="z-50">
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
