<template>
  <UModal 
    v-model="modal.isOpen"
    :ui="{ 
      width: 'max-w-7xl min-w-[800px]',
      container: 'items-start my-4',
      overlay: { background: 'bg-gray-950/75' }
    }" 
    :overlay="true" 
    :title="t('instructions')"
  >
    <template #body v-if="prompt">
      <div class="w-full space-y-4 overflow-y-auto flex-grow">
        <UTextarea 
          :value="prompt || t('no-prompt-available')" 
          class="w-full min-h-[60vh]" 
          :ui="{
            wrapper: 'w-full min-h-[60vh]',
            base: 'min-h-[60vh] font-mono text-sm',
            input: 'min-h-[60vh]'
          }"
          readonly
        />
      </div>
    </template>

    <template #body v-else>
      <div class="p-4 text-center">{{ t('no-assistant-selected') }}</div>
    </template>

    <template #footer>
      <div class="flex justify-end items-center">
        <UButton
          color="primary"
          @click="close"
        >
          {{ t('close') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()
const modal = useModal()

defineProps<{
  prompt: string
}>()

const close = () => {
  modal.close()
}
</script>
