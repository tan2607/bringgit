<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-xl font-bold">Forgot Password</h1>
        <p class="text-gray-500 mt-2 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </template>

      <UForm :schema="schema" :state="form" class="space-y-4" @submit="resetPassword">
        <UFormField label="Email" name="email">
          <UInput v-model="form.email" type="email" placeholder="Enter your email" icon="i-heroicons-envelope" required />
        </UFormField>

        <div class="flex items-center justify-between">
          <UButton type="submit" color="primary" :loading="loading">
            Reset Password
          </UButton>
          <NuxtLink to="/auth/login" class="text-sm text-gray-600 hover:text-primary">
            Back to Login
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
  email: ''
})

const schema = {
  email: {
    type: 'string',
    required: true,
    label: 'Email'
  }
}

async function resetPassword() {
  loading.value = true
  try {
    // Handle password reset logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Show success message
    useToast().add({
      title: 'Check your email',
      description: 'Instructions to reset your password have been sent.',
      icon: 'i-heroicons-envelope',
      color: 'green'
    })
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to send reset instructions',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Add styles for the forgot password page */
</style>
