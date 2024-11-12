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
const items = ref([
  {
    label: 'Main',
    icon: 'i-lucide-home',
    to: '/',
  },
  {
    label: 'Authentication',
    icon: 'i-lucide-key',
    children: [
      {
        label: 'Login',
        icon: 'i-lucide-log-in',
        description: 'Sign in to your account',
        to: '/auth/login'
      },
      {
        label: 'Sign Up',
        icon: 'i-lucide-user-plus',
        description: 'Create a new account',
        to: '/auth/signup'
      },
      {
        label: 'Forgot Password',
        icon: 'i-lucide-key',
        description: 'Reset your password',
        to: '/auth/forgot-password'
      }
    ]
  },
  {
    label: 'Features',
    icon: 'i-lucide-layout-grid',
    children: [
      {
        label: 'Calls',
        icon: 'i-lucide-phone',
        description: 'Manage your calls and meetings',
        to: '/calls'
      },
      {
        label: 'Analytics',
        icon: 'i-lucide-line-chart',
        description: 'Review detailed statistics',
        to: '/analytics'
      },
      {
        label: 'Scheduling',
        icon: 'i-lucide-calendar',
        description: 'Manage your appointments',
        to: '/scheduling'
      }
    ]
  },
  {
    label: 'Support',
    icon: 'i-lucide-help-circle',
    children: [
      {
        label: 'Settings',
        icon: 'i-lucide-settings',
        description: 'Configure your preferences',
        to: '/settings'
      },
      {
        label: 'Help Center',
        icon: 'i-lucide-life-buoy',
        description: 'Get help and support',
        to: '/help'
      }
    ]
  }
])

const colorMode = useColorMode()
</script>

<template>
  <UApp :class="{ 'dark': colorMode.value === 'dark' }">
    <!-- Navigation -->
    <UNavigationMenu :items="items" class="w-full sticky top-0 z-50 border-b bg-white dark:bg-gray-900" />
    
    <!-- Main Content -->
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in'
      }" />
    </NuxtLayout>

  </UApp>
</template>
