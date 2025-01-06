<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-message-square" class="text-primary" />
        <h3 class="font-medium">SMS Sender</h3>
      </div>
    </template>

    <div class="space-y-4">
      <UFormField label="To Number" required>
        <UInput
          v-model="formState.to"
          placeholder="+65 1234 5678"
          type="tel"
          icon="i-lucide-phone"
          :ui="{ 
            input: 'font-mono'
          }"
        />
      </UFormField>

      <UFormField label="Message" required>
        <UTextarea
          v-model="formState.message"
          :rows="4"
          placeholder="Enter your message here..."
          class="w-full"
          :ui="{ 
            base: 'relative w-full flex flex-col',
            wrapper: 'relative',
            input: 'relative block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:opacity-75 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:focus:ring-primary-400 dark:placeholder:text-gray-500',
          }"
        />
        <span class="text-xs text-gray-500 mt-1">{{ messageCount }} characters</span>
      </UFormField>

      <div class="flex justify-end pt-4">
        <UButton
          :loading="isLoading"
          :disabled="!isValid || isLoading"
          @click="sendMessage"
          color="primary"
          icon="i-lucide-send"
        >
          Send Message
        </UButton>
      </div>
    </div>

    <!-- Results Section -->
    <template v-if="lastResult" #footer>
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <UIcon 
            :name="lastResult.success ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
            :class="lastResult.success ? 'text-success' : 'text-error'"
          />
          <span :class="lastResult.success ? 'text-success' : 'text-error'">
            {{ lastResult.message }}
          </span>
        </div>
        <div v-if="lastResult.messageId" class="text-xs text-gray-500">
          Message ID: {{ lastResult.messageId }}
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const formState = reactive({
  to: '',
  message: ''
})

const isLoading = ref(false)
const lastResult = ref<{
  success: boolean
  message: string
  messageId?: string
} | null>(null)

const messageCount = computed(() => formState.message.length)

const isValid = computed(() => {
  return formState.to && formState.message
})

async function sendMessage() {
  if (!isValid.value) return

  try {
    isLoading.value = true
    const { data: response } = await useFetch('/api/sms/send', {
      method: 'POST',
      body: {
        to: formState.to,
        message: formState.message
      }
    })

    if (response.value?.success) {
      lastResult.value = {
        success: true,
        message: 'Message sent successfully',
        messageId: response.value.messageId
      }
      // Reset form
      formState.message = ''
      formState.to = ''
    } else {
      throw new Error(response.value?.message || 'Failed to send message')
    }
  } catch (error: any) {
    console.error('SMS error:', error)
    lastResult.value = {
      success: false,
      message: error.message || 'Failed to send message'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
