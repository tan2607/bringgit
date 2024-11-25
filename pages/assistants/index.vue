<template>
  <UContainer class="my-8">
    <h1 class="text-2xl font-bold mb-4">{{ t('assistant-list') }}</h1>

    <AssistantTable :data="assistants" />
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" })
import { useAssistants } from '@/composables/useAssistants'
import AssistantTable from '@/components/AssistantTable.vue'

const { t } = useI18n()
const { assistants, fetchAssistants } = useAssistants()

onMounted(() => {
  fetchAssistants()
})
</script>
