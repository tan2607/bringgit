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

// Locale dropdown
const localeDropdown = computed(() => {
    const currentLocale = locales.value?.find(l => l.code === locale.value)
    return {
        label: currentLocale?.name || t('language'),
        icon: getLocaleIcon(currentLocale?.code || 'en'),
        children: availableLocaleItems.value
    }
})

// Navigation items
const items = computed(() => [
    {
        label: t('home'),
        icon: 'i-lucide-home',
        to: localeRoute('/')?.path
    },
    {
        label: t('calls'),
        icon: 'i-lucide-phone',
        description: t('manage-calls'),
        to: localeRoute('/calls')?.path
    },
    {
        label: t('assistants'),
        icon: 'i-lucide-bot',
        description: t('manage-assistants'),
        to: localeRoute('/assistants')?.path
    },
    {
        label: t('analytics'),
        icon: 'i-lucide-line-chart',
        description: t('review-statistics'),
        to: localeRoute('/analytics')?.path
    },
    {
        label: t('scheduling'),
        icon: 'i-lucide-calendar',
        description: t('manage-schedule'),
        children: [
            {
                label: 'Jobs',
                icon: 'i-lucide-briefcase',
                description: 'Manage scheduled jobs',
                to: localeRoute('/scheduling')?.path
            },
            {
                label: 'Reports',
                icon: 'i-lucide-bar-chart',
                description: 'View job reports and analytics',
                to: localeRoute('/scheduling/reports')?.path
            },
            {
                label: 'Settings',
                icon: 'i-lucide-settings',
                description: 'Configure scheduling settings',
                to: localeRoute('/scheduling/settings')?.path
            }
        ]
    },
    {
        label: 'Phone Numbers',
        icon: 'i-lucide-phone',
        description: 'Manage phone numbers',
        to: localeRoute('/numbers')?.path
    },
    {
        label: 'Demo',
        icon: 'i-lucide-layout-template',
        description: 'View demo pages',
        children: [
            {
                label: 'Translation',
                icon: 'i-lucide-languages',
                description: 'Translation demo',
                to: localeRoute('/demo/translation')?.path
            },
            {
                label: 'Patient Intake',
                icon: 'i-lucide-clipboard-list',
                description: 'Patient intake form demo',
                to: localeRoute('/demo/patient-intake-form')?.path
            },
            {
                label: 'SMS',
                icon: 'i-lucide-message-square',
                description: 'SMS sender demo',
                to: localeRoute('/demo/sms')?.path
            },
            {
                label: 'Location Search',
                icon: 'i-lucide-map-pin',
                description: 'Clinic location search demo',
                to: localeRoute('/demo/location')?.path
            },
            {
              label: 'OCR Demo',
              icon: 'i-lucide-file-scan',
              to: localeRoute('/ocr')
            },
            {
              label: 'RPA Demo',
              icon: 'i-lucide-cpu',
              description: 'RPA',
              to: localeRoute('/demo/rpa')?.path
            },
            {
              label: 'Workflow Demo',
              icon: 'i-lucide-workflow',
              description: 'Home Sleep Study Workflow',
              to: localeRoute('/demo/workflow')?.path
            },
            {
              label: 'Report Assistant',
              icon: 'i-lucide-table',
              description: 'Ask questions about your reports',
              to: localeRoute('/demo/report-assistant')?.path
            },
        ]
    },
    {
        label: t('support'),
        icon: 'i-lucide-help-circle',
        children: [
            {
                label: t('help-center'),
                icon: 'i-lucide-life-buoy',
                description: t('get-help'),
                to: localeRoute('/help')?.path
            },
            {
                label: t('settings'),
                icon: 'i-lucide-settings',
                description: t('configure-preferences'),
                to: localeRoute('/settings')?.path
            },
            {
                label: t('view-api'),
                icon: 'i-lucide-file-json',
                to: localeRoute('/dev')?.path
            }
        ]
    },
    // Profile/Auth menu
    {
        label: session.value?.user?.name || t('profile'),
        icon: session.value?.user ? 'i-lucide-user' : 'i-lucide-key',
        children: session.value?.user ? [
            {
                label: session.value.user.email,
                icon: 'i-lucide-mail',
                disabled: true
            },
            {
                label: t('settings'),
                icon: 'i-lucide-settings',
                to: localeRoute('/settings')?.path
            },
            {
                label: t('logout'),
                icon: 'i-lucide-log-out',
                description: t('sign-out'),
                onSelect: () => signOut({ redirect: true, callbackUrl: '/auth/login' }),
                class: "cursor-pointer",
            }
        ] : [
            {
                label: t('login'),
                icon: 'i-lucide-log-in',
                description: t('sign-in'),
                to: localeRoute('/auth/login')?.path
            }
        ]
    },
    localeDropdown.value,
    {
        slot: 'color-mode',
    }
])

onMounted(() => {
  const browserLocale = locale.value;
  const supportedLocales = ['ar', 'en', 'id', 'vi', 'ja', 'ko', 'ms', 'th', 'zh_hans', 'zh_hant']
  
  // Special case for Chinese
  if (browserLocale.startsWith('zh')) {
    locale.value = browserLocale.includes('hant') ? 'zh_hant' : 'zh_hans'
    return
  }

  // For other languages, use the base language code
  const baseLocale = browserLocale.split('-')[0]
  if (supportedLocales.includes(baseLocale)) {
    locale.value = baseLocale
  }
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

        <UNavigationMenu orientation="horizontal" variant="pill" arrow highlight :items="items" class="z-50">
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
  </UApp>
</template>
