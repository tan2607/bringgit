<template>
  <USlideover
    v-model="open"
    :title="t(isDataItem ? 'analysis.add-data-item' : 'analysis.add-criteria')"
  >
    <template #body>
      <div class="p-4 space-y-4">
        <template v-if="isDataItem">
          <UFormField :label="t('analysis.identifier')" required>
            <UInput v-model="form.identifier" />
          </UFormField>

          <UFormField :label="t('analysis.type')" required>
            <USelect
              v-model="form.type"
              :items="['text', 'number', 'boolean']"
            />
          </UFormField>

          <UFormField :label="t('analysis.description')" required>
            <UTextarea
              v-model="form.description"
              :rows="3"
            />
          </UFormField>
        </template>
        <template v-else>
          <UFormField :label="t('analysis.name')" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField :label="t('analysis.prompt')" required>
            <UTextarea
              v-model="form.prompt"
              :rows="3"
            />
          </UFormField>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          :label="t('assistant.cancel')"
          @click="close"
        />
        <UButton
          color="black"
          variant="solid"
          :label="t('assistant.save')"
          @click="save"
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  type: 'criteria' | 'data'
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const { t } = useI18n()

const open = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isDataItem = computed(() => props.type === 'data')

const form = reactive({
  // Data Item fields
  identifier: '',
  type: 'text',
  description: '',
  // Criteria fields
  name: '',
  prompt: ''
})

function close() {
  open.value = false
  Object.assign(form, {
    identifier: '',
    type: 'text',
    description: '',
    name: '',
    prompt: ''
  })
}

function save() {
  emit('save', { ...form })
  close()
}
</script>
