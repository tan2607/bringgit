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
        <USelectMenu v-model="selectedBotPhoneNumber" :items="botPhoneNumbers" class="w-full" multiple placeholder="Select Bot Phone Numbers">
          <template #item="{ item }">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-phone" class="w-4 h-4" />
              <span>{{ item.name }} ({{ item.number }})</span>
            </div>
          </template>
        </USelectMenu>
      </div>
      <div class="p-4">
        <p class="text-sm font-medium my-2">Selected Bot Phone Numbers</p>
        <div class="flex gap-2 flex-wrap border rounded-md p-3 border-neutral-700">
          <div v-if="selectedBotPhoneNumber.length > 0" v-for="botPhoneNumber in selectedBotPhoneNumber" :key="botPhoneNumber">
            <UBadge class="flex items-center gap-1">
              {{ `${botPhoneNumber.name} (${botPhoneNumber.number})` }}
              <UIcon name="i-lucide-x" class="w-4 h-4 cursor-pointer"
                @click="selectedBotPhoneNumber = selectedBotPhoneNumber.filter(a => a !== botPhoneNumber)" />
            </UBadge>
          </div>
          <div v-else>
            <p class="text-sm text-neutral-500">No bot phone numbers selected</p>
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
import type { PhoneNumbers } from '@vapi-ai/server-sdk/api/resources/phoneNumbers/client/Client';
const props = defineProps<{
  isOpen: boolean
}>()


const botPhoneNumbers = defineModel<PhoneNumbers[]>('botPhoneNumbers', { required: true })
const selectedUser = defineModel<User>('selectedUser', { required: true })

const selectedBotPhoneNumber = ref<string[]>([])

const { updateUserBotPhoneNumbers } = useUserManagement()
const toast = useToast()

// Initialize selected assistants when modal opens or user changes
watch([() => props.isOpen, selectedUser], () => {
  if (props.isOpen && selectedUser.value) {
    selectedBotPhoneNumber.value = selectedUser.value.botPhoneNumbers
  }
}, { immediate: true })

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const handleSave = async () => {
  if (selectedUser.value) {
    try {
      const botPhoneNumbers = selectedBotPhoneNumber.value
      await updateUserBotPhoneNumbers(selectedUser.value.id, botPhoneNumbers)
      
      // Update the local user state
      selectedUser.value.botPhoneNumbers = botPhoneNumbers
      
      // Show success toast
      toast.add({
        title: 'Success',
        description: 'Bot phone numbers updated successfully. Please refresh the data.',
      })
      
      // Close the modal
      emit('update:isOpen', false)
    } catch (error) {
      // Show error toast
      toast.add({
        title: 'Error',
        description: 'Failed to update bot phone numbers',
      })
      console.error('Failed to update user bot phone numbers:', error)
    }
  }
}

</script>

<style></style>