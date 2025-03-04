<template>
  <UModal :open="props.isOpen" @update:open="$emit('update:isOpen', $event)">
    <template #header>
      <div class="p-4">
        <h1>Edit Assistant</h1>
      </div>
    </template>
    <template #body>
      <div class="p-4">
        <p class="text-sm font-medium my-2">Select Assistants</p>
        <USelectMenu v-model="selectedAssistant" :items="assistants" class="w-full" multiple placeholder="Select Assistants"
          label-key="name" />
      </div>
      <div class="p-4">
        <p class="text-sm font-medium my-2">Selected Assistants</p>
        <div class="flex gap-2 flex-wrap border rounded-md p-3 border-neutral-700">
          <div v-if="selectedAssistant.length > 0" v-for="assistant in selectedAssistant" :key="assistant.id">
            <UBadge class="flex items-center gap-1">
              {{ assistant.name }}
              <UIcon name="i-lucide-x" class="w-4 h-4 cursor-pointer"
                @click="selectedAssistant = selectedAssistant.filter(a => a !== assistant)" />
            </UBadge>
          </div>
          <div v-else>
            <p class="text-sm text-neutral-500">No assistants selected</p>
          </div>
        </div>

      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton @click="$emit('update:isOpen', false)" class="cursor-pointer">Close</UButton>
        <UButton @click="$emit('update:isOpen', false)" class="cursor-pointer">Save</UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { User } from '@auth/core/types';
import type { Assistant } from '~/types/assistant';

const props = defineProps<{
  isOpen: boolean
}>()


const assistants = defineModel<Assistant[]>('assistants', { required: true })
const selectedUser = defineModel<User>('selectedUser', { required: true })

const selectedAssistant = ref<any[]>([])


const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()


</script>

<style></style>