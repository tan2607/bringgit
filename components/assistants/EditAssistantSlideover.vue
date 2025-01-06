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
        <UTabs v-model="activeTab" :items="tabs">
          <template #default="{ item }">
            <div class="p-4">
              <!-- Agent Tab -->
              <div v-if="item.value === 'agent'" class="space-y-4">
                <UFormField :label="t('assistant.name')" required>
                  <UInput v-model="assistant.name" />
                </UFormField>

                <UFormField :label="t('assistant.language')" required>
                  <USelect v-model="assistant.language" :items="languageOptions" option-attribute="value" />
                  <template #help>
                    {{ t('assistant.language-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.firstMessage')" required>
                  <UTextarea v-model="assistant.firstMessage" :rows="3" />
                  <template #help>
                    {{ t('assistant.firstMessage-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.systemPrompt')" required>
                  <UTextarea v-model="assistant.systemPrompt" :rows="5" />
                  <template #help>
                    {{ t('assistant.systemPrompt-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.llm')">
                  <USelect v-model="assistant.llm" :items="llmOptions" option-attribute="value" />
                  <template #help>
                    {{ t('assistant.llm-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.temperature')">
                  <UInput type="range" v-model="assistant.temperature" :min="0" :max="2" :step="0.1" />
                  <template #help>
                    {{ t('assistant.temperature-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.tokenLimit')">
                  <UInput v-model="assistant.tokenLimit" type="number" placeholder="-1" />
                  <template #help>
                    {{ t('assistant.tokenLimit-help') }}
                  </template>
                </UFormField>

                <div class="flex justify-end gap-2">
                  <UButton color="neutral" variant="outline" :label="t('assistant.cancel')" @click="close" />
                  <UButton color="black" variant="solid" :label="t('assistant.save')" @click="save" />
                </div>
              </div>

              <!-- Analysis Tab -->
              <div v-if="item.value === 'analysis'" class="space-y-6">
                <!-- Evaluation Criteria -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium">{{ t('analysis.evaluation-criteria') }}</h3>
                    <UButton color="black" variant="solid" :label="t('analysis.add-criteria')"
                      @click="$emit('add-criteria')" />
                  </div>

                  <div class="space-y-2">
                    <!-- Criteria list -->
                    <div v-if="assistant.metadata?.criteria?.length" class="space-y-2">
                      <div v-for="criterion in assistant.metadata.criteria" :key="criterion.id"
                        class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-start">
                          <div>
                            <h4 class="font-medium">{{ criterion.name }}</h4>
                            <p class="text-sm text-gray-600 mt-1">{{ criterion.prompt }}</p>
                          </div>
                          <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost"
                            @click="deleteCriterion(criterion.id)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Data Collection -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium">{{ t('analysis.data-collection') }}</h3>
                    <UButton color="black" variant="solid" :label="t('analysis.add-data-item')"
                      @click="$emit('add-data-item')" />
                  </div>

                  <div class="space-y-2">
                    <!-- Data items list -->
                    <div v-if="assistant.metadata?.dataItems?.length" class="space-y-2">
                      <div v-for="item in assistant.metadata.dataItems" :key="item.id"
                        class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-start">
                          <div>
                            <div class="flex items-center gap-2">
                              <h4 class="font-medium">{{ item.identifier }}</h4>
                              <UBadge color="neutral" variant="soft" size="sm">{{ item.type }}</UBadge>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">{{ item.description }}</p>
                          </div>
                          <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost"
                            @click="deleteDataItem(item.id)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="black" variant="outline" :label="t('assistant.test')" @click="$emit('test')" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Vapi } from '@vapi-ai/server-sdk'
import { languageOptions, llmOptions } from '~/types/assistant'

interface Props {
  modelValue: boolean
  assistant: Vapi.Assistant
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save', 'test', 'add-criteria', 'add-data-item'])

const { t } = useI18n()

const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const activeTab = ref('agent')

const tabs = [
  {
    name: t('assistant.agent'),
    value: 'agent'
  },
  {
    name: t('assistant.analysis'),
    value: 'analysis'
  }
]

function close() {
  open.value = false
}

function save() {
  emit('save', props.assistant)
  close()
}

function deleteCriterion(id: string) {
  if (props.assistant.metadata?.criteria) {
    props.assistant.metadata.criteria = (props.assistant.metadata.criteria as any[]).filter(c => c.id !== id)
  }
}

function deleteDataItem(id: string) {
  if (props.assistant.metadata?.dataItems) {
    props.assistant.metadata.dataItems = (props.assistant.metadata.dataItems as any[]).filter(item => item.id !== id)
  }
}
</script>
