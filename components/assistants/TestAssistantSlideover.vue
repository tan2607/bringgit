<template>
  <USlideover 
    v-model="open"
    :title="`${t('assistant.test')} ${assistant?.name}`"
  >
    <template #body>
      <div class="h-full">
        <iframe 
          :src="`https://vai.keyreply.com/${assistant?.id}`"
          class="w-full h-full"
          frameborder="0"
        ></iframe>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  assistant: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const open = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
