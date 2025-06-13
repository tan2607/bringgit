<template>
  <main class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <p class="text-gray-600 dark:text-gray-400">Redirecting...</p>
  </main>
</template>

<script setup lang="ts">
const { signIn } = useAuth()

definePageMeta({
  middleware: "guest-only", 
  auth: { authenticatedRedirectTo: "/" },
  layoutTransition: false,
  pageTransition: false
})

onMounted(async () => {
  await signIn('auth0')
})
</script>
