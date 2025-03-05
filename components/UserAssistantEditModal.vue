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
        <UButton @click="handleSave" color="primary" class="cursor-pointer">Save</UButton>
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

const selectedAssistant = ref<Assistant[]>([])

const { updateUserAssistants } = useUserManagement()
const toast = useToast()

// Initialize selected assistants when modal opens or user changes
watch([() => props.isOpen, selectedUser], () => {
  if (props.isOpen && selectedUser.value) {
    selectedAssistant.value = assistants.value.filter(assistant => 
      selectedUser.value.assistants?.includes(assistant.id)
    )
  }
}, { immediate: true })

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const handleSave = async () => {
  if (selectedUser.value) {
    try {
      const assistantIds = selectedAssistant.value.map(a => a.id)
      await updateUserAssistants(selectedUser.value.id, assistantIds)
      
      // Update the local user state
      selectedUser.value.assistants = assistantIds
      
      // Show success toast
      toast.add({
        title: 'Success',
        description: 'Assistants updated successfully. Please refresh the data.',
      })
      
      // Close the modal
      emit('update:isOpen', false)
    } catch (error) {
      // Show error toast
      toast.add({
        title: 'Error',
        description: 'Failed to update assistants',
      })
      console.error('Failed to update user assistants:', error)
    }
  }
}

</script>

<style></style>