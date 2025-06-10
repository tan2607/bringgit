<script setup>
import { useConfirm } from '~/composables/useConfirm'

const { close, message, visible } = useConfirm()
</script>

<template>
  <UModal v-model:open="visible">
      <template #header>
        <h3 class="text-lg font-semibold">Confirm Action</h3>
      </template>

      <template #body>
        <p>{{ message }}</p>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton color="neutral" class="cursor-pointer" @click="close(false)">Cancel</UButton>
          <UButton color="primary" class="cursor-pointer" @click="close(true)">Confirm</UButton>
        </div>
      </template>
  </UModal>
</template>
