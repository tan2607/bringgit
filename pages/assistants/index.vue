<template>
  <UContainer class="my-8">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bot" class="w-6 h-6" />
        <h1 class="text-2xl font-bold">{{ t('assistant-list') }}</h1>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        :label="t('assistant.create')"
        @click="openCreateSlideover"
      />
    </div>

    <AssistantTable :data="sortedAssistants" />
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" })
import { useAssistants } from '@/composables/useAssistants'
import AssistantTable from '@/components/AssistantTable.vue'
import CreateAssistantSlideover from '@/components/assistants/CreateAssistantSlideover.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { assistants, fetchAssistants } = useAssistants()
const slideover = useSlideover()

function openCreateSlideover() {
  slideover.open(CreateAssistantSlideover, {
      title: t('assistant.create'),
      onCreated: () => {
        fetchAssistants()
      }
  })
}

const sortedAssistants = computed(() => {
  if(!assistants.value) return []
  return assistants.value.sort((a, b) => a.name.localeCompare(b.name))
})

onMounted(() => {
  fetchAssistants()
})
</script>
