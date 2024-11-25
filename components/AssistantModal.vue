<template>
  <UModal 
    v-model="modal.isOpen"
    :ui="{ width: 'max-w-6xl' }"
    :overlay="true"
    :title="assistantName"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-xl font-semibold">{{ t('call-assistant') }}</h3>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          @click="close"
        />
      </div>
    </template>

    <template #body>
      <div class="h-[80vh]">
        <iframe 
          :src="`https://vai.keyreply.com/${assistantName}`"
          class="w-full border-0 rounded-lg"
          allow="microphone"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end items-center">
        <UButton
          color="primary"
          @click="close"
        >
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()
const modal = useModal()

defineProps<{
  assistantName: string
}>()

const close = () => {
  modal.close()
}
</script>
