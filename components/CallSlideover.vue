<template>
  <USlideover>
    <template #body>
      <CallForm :assistant-id="assistant?.id!" :assistant-name="assistant?.name!" @success="handleSuccess" @error="handleError" @cancel="close" />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CallForm from './CallForm.vue'
import type { Vapi } from '@vapi-ai/server-sdk'

const { t } = useI18n()
const slideover = useSlideover()
const toast = useToast()

const props = defineProps<{
  assistant?: Vapi.Assistant
}>()

const handleSuccess = (message: string) => {
  toast.add({
    title: t('success'),
    description: message,
    color: 'success',
    icon: 'i-lucide-check'
  })
  close()
}

const handleError = (message: string) => {
  toast.add({
    title: t('error'),
    description: message,
    color: 'error',
    icon: 'i-lucide-x'
  })
}

const close = () => {
  slideover.close()
}
</script>
