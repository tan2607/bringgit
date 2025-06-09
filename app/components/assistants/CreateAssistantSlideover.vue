<template>
  <USlideover 
    :title="title"
  >
    <template #body>
      <div class="space-y-6">
        <UFormField :label="t('assistant.name')" required>
          <UInput 
            v-model="newAgent.name" 
            :placeholder="t('assistant.name')"
            icon="i-lucide-bot"
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UCard v-for="template in templates" :key="template.id"
            :ui="{ 
              base: 'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800', 
              ring: '', 
              shadow: '' 
            }"
            :class="{ 'ring-2 ring-primary-500': selectedTemplate === template.id }"
            @click="selectedTemplate = template.id">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon :name="template.icon" class="w-5 h-5" />
                <span class="font-medium">{{ t(`assistant.${template.id}`) }}</span>
              </div>
            </template>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ t(`assistant.${template.id}-desc`) }}</p>
            <div v-if="template.avatar" class="mt-2">
              <UAvatar :src="template.avatar.src" :alt="template.avatar.name" size="sm" />
              <span class="text-sm ml-2">{{ template.avatar.name }}</span>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="soft" :label="t('cancel')" @click="close" />
        <UButton 
          color="primary" 
          :label="t('create')" 
          :loading="isCreating"
          :disabled="!isValid"
          @click="createAgent" 
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { defaultAssistant } from '@@/types/assistant'
import type { Assistant } from '@@/types/assistant'
import { useAssistant } from '~/composables/useAssistant'

interface Props {
  title?: string
}

defineProps<Props>()
const emit = defineEmits(['created', 'close'])

const { t } = useI18n()
const { templates, applyTemplate } = useAssistant()

const selectedTemplate = ref('')
const newAgent = reactive<Assistant>({ ...defaultAssistant })

const isCreating = ref(false)
const isValid = computed(() => newAgent.name && selectedTemplate.value)

watch(selectedTemplate, (newTemplate) => {
  if (newTemplate) {
    applyTemplate(newAgent, newTemplate)
  }
})

async function createAgent() {
  if (!isValid.value) return
  
  isCreating.value = true
  try {
    const { id, orgId, createdAt, updatedAt, ...newAssistant } = newAgent
    const createdAssistant = await $fetch('/api/assistants/create', {
      method: 'POST',
      body: newAssistant
    })
    emit('created', createdAssistant)
    emit('close')
  } catch (error) {
    console.error('Failed to create assistant:', error)
  } finally {
    isCreating.value = false
  }
}

function close() {
  emit('close')
}
</script>
