<template>
  <USlideover :title="t('assistant.test')">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-test-tube-2" class="w-5 h-5" />
          <span class="text-lg font-medium">{{ t('assistant.test') }}</span>
        </div>
      </div>
    </template>

    <div class="space-y-4 p-4">
      <UFormField :label="t('assistant.test-message')" required>
        <UTextarea
          v-model="testMessage"
          :rows="4"
          :placeholder="t('assistant.test-message-placeholder')"
        />
      </UFormField>

      <div v-if="response" class="space-y-2">
        <div class="font-medium">{{ t('assistant.response') }}:</div>
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg whitespace-pre-wrap">
          {{ response }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="gray"
          variant="soft"
          @click="close"
        >
          {{ t('close') }}
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="isLoading"
          :disabled="!testMessage"
          @click="sendTest"
        >
          {{ t('send') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantState } from '@/composables/useAssistantState'

const { t } = useI18n()
const slideover = useSlideover()
const { currentAssistant } = useAssistantState()

const testMessage = ref('')
const response = ref('')
const isLoading = ref(false)

const close = () => {
  slideover.close()
  testMessage.value = ''
  response.value = ''
}

const sendTest = async () => {
  if (!testMessage.value || !currentAssistant.value) return

  try {
    isLoading.value = true
    const { data } = await useFetch('/api/assistant/test', {
      method: 'POST',
      body: {
        assistantId: currentAssistant.value.id,
        message: testMessage.value
      }
    })
    response.value = data.value?.response || ''
  } catch (error: any) {
    console.error('Test error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
