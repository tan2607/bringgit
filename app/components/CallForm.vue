<template>
  <UForm :state="state" :validate="validateForm" @submit="makeCall">
    <UCard class="bg-gray-50 dark:bg-gray-800/50">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-phone-call" class="text-primary-500" />
          <h3 class="text-lg font-medium">Call {{ assistantName }} Assistant</h3>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="From" name="from" required>
          <PhoneNumberSelect v-model="state.from" class="w-full" />
        </UFormField>

        <UFormField label="To" name="to" required>
          <UInput v-model="state.to" placeholder="+6512345678" icon="i-lucide-phone" type="tel" class="w-full" />
          <template #help>
            <span class="text-xs text-gray-500">Enter phone number with country code</span>
          </template>
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton type="button" color="neutral" variant="soft" icon="i-lucide-x" @click="resetForm">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="isLoading" icon="i-lucide-phone-call">
            Make Call
          </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>

<script setup lang="ts">
const props = defineProps<{
  assistantId: string
  assistantName: string
}>()

const emit = defineEmits<{
  success: [message: string]
  error: [message: string]
  cancel: []
}>()

const isLoading = ref(false)

const state = reactive({
  from: '',
  to: ''
})

const validateForm = (state: any): FormError[] => {
  const errors: FormError[] = []
  
  if (!state.from) {
    errors.push({ path: 'from', message: 'Please select a phone number' })
  }
  
  if (!state.to) {
    errors.push({ path: 'to', message: 'Please enter a phone number' })
  } else if (!state.to.match(/^\+?[1-9]\d{1,14}$/)) {
    errors.push({ path: 'to', message: 'Please enter a valid phone number' })
  }
  
  return errors
}

const resetForm = () => {
  state.from = ''
  state.to = ''
  emit('cancel')
}

const makeCall = async (event: FormSubmitEvent<any>) => {

  try {
    isLoading.value = true
    const { data: response } = await useFetch('/api/call', {
      method: 'POST',
      body: {
        assistantId: props.assistantId,
        phoneNumberId: state.from,
        phoneNumber: state.to
      }
    })

    if (response.value?.success) {
      emit('success', `Call initiated to ${state.to}`)
      resetForm()
    } else {
      throw new Error(response.value?.message || 'Failed to initiate call')
    }
  } catch (error: any) {
    console.error('Call error:', error)
    emit('error', error.message || 'Failed to make call')
  } finally {
    isLoading.value = false
  }
}
</script>
