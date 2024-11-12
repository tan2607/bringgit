<template>
  <div class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-xl font-bold">Login</h1>
      </template>

      <UForm :state="form" @submit="login">
        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            icon="i-heroicons-envelope"
            required
          />
        </UFormField>

        <UFormField label="Password" required class="mt-4">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            icon="i-heroicons-lock-closed"
            required
          />
        </UFormField>

        <div class="flex justify-between items-center mt-6">
          <UButton type="submit" color="primary" :loading="loading">
            Login
          </UButton>
          <NuxtLink to="/auth/forgot-password" class="text-sm text-gray-600 hover:text-primary">
            Forgot Password?
          </NuxtLink>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false)
const form = ref({
  email: '',
  password: ''
})

async function login(event) {
  loading.value = true
  try {
    // Handle login logic
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Add styles for the login page */
</style>
