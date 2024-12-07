<style>
@import "tailwindcss";
@import "@nuxt/ui-pro";

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
const { locale, locales } = useI18n()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

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
  <UApp :locale="locales[locale as string]" :class="{ 'dark': colorMode.value === 'dark' }">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in'
      }" />
    </NuxtLayout>
  </UApp>
</template>
