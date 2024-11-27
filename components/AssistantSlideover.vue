<template>
  <USlideover 
    v-model="slideover.isOpen"
    :title="assistantName"
    :ui="{ footer: 'justify-end' }"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-xl font-semibold">{{ t('call-assistant') }}</h3>
      </div>
    </template>

    <template #body>
      <div class="h-full">
        <iframe 
          :src="`https://vai.keyreply.com/${assistantName}`"
          class="w-full h-full border-0 rounded-lg"
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
  </USlideover>
</template>

<script setup lang="ts">
const { t } = useI18n()
const slideover = useSlideover()

defineProps<{
  assistantName: string
}>()

const close = () => {
  slideover.close()
}
</script>
