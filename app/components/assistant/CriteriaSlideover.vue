<template>
  <USlideover :title="t('analysis.add-criterion')">
    <div class="space-y-4 p-4">
      <UFormField :label="t('analysis.criterion-name')" required>
        <UInput v-model="name" />
      </UFormField>

      <UFormField :label="t('analysis.criterion-description')" required>
        <UTextarea
          v-model="description"
          :rows="3"
        />
      </UFormField>

      <UFormField :label="t('analysis.criterion-examples')" required>
        <UTextarea
          v-model="examples"
          :rows="4"
          :placeholder="t('analysis.criterion-examples-placeholder')"
        />
        <template #help>
          {{ t('analysis.criterion-examples-help') }}
        </template>
      </UFormField>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="gray"
          variant="soft"
          @click="close"
        >
          {{ t('cancel') }}
        </UButton>
        <UButton
          color="primary"
          :loading="isLoading"
          :disabled="!isValid"
          @click="save"
        >
          {{ t('save') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantState } from '@/composables/useAssistantState'

const { t } = useI18n()
const { currentAssistant } = useAssistantState()

const name = ref('')
const description = ref('')
const examples = ref('')
const isLoading = ref(false)

const isValid = computed(() => {
  return name.value && description.value && examples.value
})

const close = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  name.value = ''
  description.value = ''
  examples.value = ''
}

const save = async () => {
  if (!isValid.value || !currentAssistant.value) return

  try {
    isLoading.value = true
    const newCriterion = {
      id: crypto.randomUUID(),
      name: name.value,
      description: description.value,
      examples: examples.value.split('\n').filter(Boolean)
    }

    currentAssistant.value.criteria = [
      ...(currentAssistant.value.criteria || []),
      newCriterion
    ]

    close()
  } catch (error: any) {
    console.error('Save criterion error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
