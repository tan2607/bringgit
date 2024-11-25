<style>
@import "tailwindcss";
@import "@nuxt/ui";

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Base styles for content spacing */
.u-card {
  @apply mb-6 last:mb-0;
}

/* Content container spacing */
.content-container {
  @apply space-y-6;
}
</style>

<script setup lang="ts">
import { availableLocales, getLocaleIcon } from '~/i18n/config'

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const lang = computed(() => locale.value)
const dir = computed(() => locales[locale.value]?.dir || 'ltr')

// Available locales for the dropdown
const availableLocaleItems = computed(() => 
  (locales.value || []).map(l => ({
    label: l.name,
    icon: getLocaleIcon(l.code),
    to: switchLocalePath(l.code)
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
    to: '/'
  },
  {
    label: t('calls'),
    icon: 'i-lucide-phone',
    description: t('manage-calls'),
    to: '/calls'
  },
  {
    label: t('assistants'),
    icon: 'i-lucide-bot',
    description: t('manage-assistants'),
    to: '/assistants'
  },
  {
    label: t('analytics'),
    icon: 'i-lucide-line-chart',
    description: t('review-statistics'),
    to: '/analytics'
  },
  {
    label: t('scheduling'),
    icon: 'i-lucide-calendar',
    description: t('manage-schedule'),
    to: '/scheduling'
  },
  {
    label: t('support'),
    icon: 'i-lucide-help-circle',
    children: [
      {
        label: t('help-center'),
        icon: 'i-lucide-life-buoy',
        description: t('get-help'),
        to: '/help'
      },
      {
        label: t('settings'),
        icon: 'i-lucide-settings',
        description: t('configure-preferences'),
        to: '/settings'
      }
    ]
  },
  {
    label: t('demos'),
    icon: 'i-lucide-sparkles',
    description: t('explore-demos'),
    children: [
      {
        label: t('voice-translation'),
        description: t('multilingual-voice-translation'),
        to: '/demo/translation'
      }
    ]
  },
  {
    label: t('dev-tools'),
    icon: 'i-lucide-wrench',
    children: [
      {
        label: t('view-api'),
        icon: 'i-lucide-file-json',
        to: '/dev'
      }
    ]
  },
  {
    label: t('profile'),
    icon: 'i-lucide-key',
    children: [
      {
        label: t('login'),
        icon: 'i-lucide-log-in',
        description: t('sign-in'),
        to: '/auth/login'
      },
      {
        label: t('sign-up'),
        icon: 'i-lucide-user-plus',
        description: t('create-account'),
        to: '/auth/signup'
      },
      {
        label: t('forgot-password'),
        icon: 'i-lucide-key',
        description: t('reset-password'),
        to: '/auth/forgot-password'
      }
    ]
  },
  localeDropdown.value
])

const colorMode = useColorMode()

onMounted(() => {
  const browserLocale = locale.value;
  const supportedLocales = ['ar', 'en', 'id', 'ja', 'ko', 'ms', 'th', 'zh_hans', 'zh_hant']
  
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
  title: 'KeyReply Voice AI',
  htmlAttrs: {
    lang,
    dir
  }
})
</script>

<template>
  <UApp :locale="locales[locale as string]" :class="{ 'dark': colorMode.value === 'dark' }">
    <!-- Navigation -->
    <UNavigationMenu highlight :items="items" class="w-full sticky top-0 z-50 border-b bg-white dark:bg-gray-900" />

    <!-- Main Content -->
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in'
      }" />
    </NuxtLayout>

  </UApp>
</template>
