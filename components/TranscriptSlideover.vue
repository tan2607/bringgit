<template>
  <USlideover 
    v-model="slideover.isOpen" 
    :ui="{ content: 'sm:max-w-7xl', footer: 'justify-end' }" 
    title="Call Transcript"
  >
    <template #body v-if="call">
      <div class="h-full space-y-4 overflow-y-auto">
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
      <div class="flex justify-end items-center space-x-4">
        <UButton
          color="neutral"
          variant="soft"
          @click="close"
        >
          Close
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useCalls } from '@/composables/useCalls'

const { selectedCall: call } = useCalls()
const slideover = useSlideover()

const close = () => {
  slideover.close()
}
</script>
