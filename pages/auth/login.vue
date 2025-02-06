<template>
  <div class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-xl font-bold">Login</h1>
      </template>

      <div class="mb-6">
        <UButton
          block
          color="white"
          class="border flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100"
          @click="handleSignIn('microsoft-entra-id')"
          :loading="loading"
        >
          <!-- <img src="/microsoft-logo.svg" alt="Microsoft" class="w-5 h-5" /> -->
          Sign in with Microsoft
        </UButton>

        <UButton
          block
          color="white"
          class="border flex items-center justify-center gap-2 mt-3 cursor-pointer hover:bg-gray-100"
          @click="handleSignIn('auth0')"
          :loading="loading"
        >
          Sign in with Auth0
        </UButton>
      </div>

      <template v-if="isDevelopment">
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <UForm :state="form" @submit="login">
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
              icon="i-lucide-lock"
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
      </template>
    </UCard>
  </div>
</template>

<script setup type="ts">
const { signIn } = useAuth()
definePageMeta({ middleware: "guest-only", auth: { authenticatedRedirectTo: "/" } })

const loading = ref(false)
const form = ref({
  email: 'dev@keyreply.com',
  password: 'password'
})
const isDevelopment = process.env.NODE_ENV === 'development'

function handleSignIn(provider) {
  loading.value = true
  signIn(provider)
}

async function login(event) {
  loading.value = true
  try {
    const result = await signIn('credentials', {
      email: form.value.email,
      password: form.value.password,
      redirect: false
    })

    if (result?.ok) {
      // Redirect to home page on successful login
      await navigateTo('/')
    } else {
      throw new Error(result?.error || 'Authentication failed')
    }
  } catch (error) {
    console.error('Login failed:', error)
    // Show error message to user
    useToast().add({
      title: 'Login Failed',
      description: error.message || 'Invalid email or password',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Add styles for the login page */
</style>
