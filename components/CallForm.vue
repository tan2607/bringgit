<template>
  <UForm @submit="makeCall">
    <UCard class="bg-gray-50 dark:bg-gray-800/50">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-phone-call" class="text-primary-500" />
          <h3 class="text-lg font-medium">Call {{ assistantName }} Assistant</h3>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="From" name="from" required :error="errors.from">
          <PhoneNumberSelect v-model="fromNumber" @update:model-value="errors.from = ''" class="w-full" />
        </UFormField>

        <UFormField label="To" name="to" required :error="errors.to">
          <UInput v-model="toNumber" placeholder="+65 1234 5678" icon="i-lucide-phone" type="tel"
            @update:model-value="errors.to = ''" class="w-full" />
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
          <UButton type="submit" color="primary" :loading="isLoading" :disabled="!isValid" icon="i-lucide-phone-call">
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

const fromNumber = ref('')
const toNumber = ref('')
const isLoading = ref(false)
const errors = reactive({
  from: '',
  to: ''
})

const isValid = computed(() => {
  return fromNumber.value && toNumber.value && !errors.from && !errors.to
})

const validateForm = () => {
  let isValid = true
  errors.from = !fromNumber.value ? 'Please select a phone number' : ''
  errors.to = !toNumber.value ? 'Please enter a phone number' : ''

  if (!toNumber.value?.match(/^\+?[1-9]\d{1,14}$/)) {
    errors.to = 'Please enter a valid phone number'
    isValid = false
  }

  return isValid
}

const resetForm = () => {
  fromNumber.value = ''
  toNumber.value = ''
  errors.from = ''
  errors.to = ''
  emit('cancel')
}

const makeCall = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    const { data: response } = await useFetch('/api/call', {
      method: 'POST',
      body: {
        assistantId: props.assistantId,
        phoneNumberId: fromNumber.value,
        phoneNumber: toNumber.value
      }
    })

    if (response.value?.success) {
      emit('success', `Call initiated to ${toNumber.value}`)
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
