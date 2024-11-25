<template>
  <UModal 
    v-model="modal.isOpen" 
    :ui="{ width: 'max-w-4xl' }" 
    :overlay="true" 
    title="Call Transcript"
  >
    <template #body v-if="call">
      <div class="space-y-4 overflow-y-auto flex-grow">
        <!-- Summary Section -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 class="font-medium mb-2">Summary</h4>
          <MDC :value="call.summary || 'No summary available'" />
        </div>

        <!-- Transcript Section -->
        <div>
          <h4 class="font-medium mb-2">Full Transcript</h4>
          <MDC :value="call.transcript || 'No transcript available'" />
        </div>
      </div>
    </template>

    <template #body v-else>
      <div class="p-4 text-center">No call selected</div>
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
import { useCalls } from '@/composables/useCalls'

const { selectedCall: call } = useCalls()
const modal = useModal()

const close = () => {
  modal.close()
}
</script>
