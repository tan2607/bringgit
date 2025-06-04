<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-xl font-bold">Sign Up</h1>
        <p class="text-gray-500 mt-2 text-sm">
          Create your account to get started
        </p>
      </template>

      <UForm :state="form" @submit="signup">
        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            icon="i-lucide-mail"
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

        <UFormField label="Confirm Password" required class="mt-4">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            icon="i-heroicons-lock-closed"
            required
          />
        </UFormField>

        <div class="flex items-center justify-between mt-6">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
          >
            Create Account
          </UButton>
          <NuxtLink to="/auth/login" class="text-sm text-gray-600 hover:text-primary">
            Already have an account?
          </NuxtLink>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
const loading = ref(false)
const form = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

async function signup() {
  if (form.value.password !== form.value.confirmPassword) {
    useToast().add({
      title: 'Error',
      description: 'Passwords do not match',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error'
    })
    return
  }

  loading.value = true
  try {
    // Handle signup logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    useToast().add({
      title: 'Success',
      description: 'Account created successfully',
      icon: 'i-heroicons-check-circle',
      color: 'success'
    })
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to create account',
      icon: 'i-heroicons-exclamation-triangle', 
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>