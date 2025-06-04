<template>
  <USlideover>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bot" class="w-5 h-5" />
          <span class="text-lg font-medium">{{ t(`assistant.${assistant?.id ? 'edit' : 'create'}`) }}</span>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full">
        <UTabs v-model="assistantState.activeTab.value" :items="tabs">
          <template #content="{ item }">
            <div class="p-4">
              <!-- Agent Tab -->
              <div v-if="item.value === 'agent'" class="space-y-4">
                <UFormField :label="t('assistant.name')" required>
                  <UInput class="w-full" v-model="assistant.name" />
                </UFormField>

                <UFormField :label="t('assistant.transcriber.language')" required>
                  <USelect 
                  class="w-full"
                  v-model="assistant.transcriber.language" :items="languageOptions" option-attribute="label" />
                  <template #help>
                    {{ t('assistant.language-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.firstMessage')" required>
                  <UTextarea 
                  class="w-full"
                  v-model="assistant.firstMessage" :rows="2" />
                  <template #help>
                    {{ t('assistant.firstMessage-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.systemPrompt')" required>
                  <UTextarea 
                  class="w-full"
                  v-model="assistant.model.messages[0].content" :rows="10" autoresize :maxrows="30" />
                  <template #help>
                    {{ t('assistant.systemPrompt-help') }}
                  </template>
                </UFormField>
              </div>

              <!-- Analysis Tab -->
              <div v-if="item.value === 'analysis'" class="space-y-6">
                <!-- Evaluation Criteria -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium">{{ t('analysis.evaluation-criteria') }}</h3>
                    <UButton color="primary" variant="soft" icon="i-lucide-plus" @click="openAddCriteria">
                      {{ t('analysis.add-criterion') }}
                    </UButton>
                  </div>

                  <div v-if="assistant.criteria?.length" class="space-y-4">
                    <UCard v-for="criterion in assistant.criteria" :key="criterion.id"
                      class="bg-gray-50 dark:bg-gray-800/50">
                      <div class="flex justify-between items-start gap-4">
                        <div class="space-y-1 flex-1">
                          <h4 class="font-medium">{{ criterion.name }}</h4>
                          <p class="text-sm text-gray-500">{{ criterion.description }}</p>
                        </div>
                        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs"
                          @click="deleteCriterion(criterion.id)" />
                      </div>
                    </UCard>
                  </div>
                  <div v-else class="text-center py-8 text-gray-500">
                    {{ t('analysis.no-criteria') }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="soft" @click="close">
          {{ t('cancel') }}
        </UButton>
        <UButton color="primary" :loading="isLoading" :disabled="!isValid" @click="save">
          {{ t('save') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantState } from '@/composables/useAssistantState'
import TestSlideover from './assistant/TestSlideover.vue'
import CriteriaSlideover from './assistant/CriteriaSlideover.vue'

import { languages } from '@@/i18n/languages'
import type { Assistant } from '@@/types/assistant'

const { t } = useI18n()
const overlay = useOverlay()
const testSlideover = overlay.create(TestSlideover)
const criteriaSlideover = overlay.create(CriteriaSlideover)

const assistantState = useAssistantState()

const props = defineProps<{
  assistant: Assistant
}>()

const assistant = ref<Assistant>(props.assistant)

const isLoading = ref(false)

const tabs = computed(() => [
  {
    label: t('assistant.agent'),
    value: 'agent',
    icon: 'i-lucide-bot'
  },
  {
    label: t('assistant.analysis'),
    value: 'analysis',
    icon: 'i-lucide-chart-bar'
  }
])

const languageOptions = computed(() => languages.map(lang => ({
  value: lang.code,
  label: lang.name
})))

const isValid = computed(() => {
  return assistant.value.name &&
    assistant.value.transcriber?.language &&
    assistant.value.firstMessage &&
    assistant.value.model?.messages?.[0]?.content
})

const close = () => {
  emit('close')
  assistantState.resetState()
}

const save = async () => {
  if (!isValid.value) return

  try {
    isLoading.value = true
    // Save assistant logic here
    close()
  } catch (error: any) {
    console.error('Save assistant error:', error)
  } finally {
    isLoading.value = false
  }
}

const openTest = () => {
  assistantState.isTestMode.value = true
  testSlideover.open()
}

const openAddCriteria = () => {
  criteriaSlideover.open()
}

const deleteCriterion = (id: string) => {
  assistant.value.criteria = assistant.value.criteria?.filter(c => c.id !== id)
}

// Set current assistant in shared state
onMounted(() => {
  if (props.assistant) {
    assistantState.setAssistant(props.assistant)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  assistantState.resetState()
})
</script>
