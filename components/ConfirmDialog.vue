<script setup>
import { useConfirm } from '~/composables/useConfirm'

const { close, message } = useConfirm()
</script>

<template>
  <UModal>
      <template #header>
        <h3 class="text-lg font-semibold">Confirm Action</h3>
      </template>

      <template #body>
        <p>{{ message }}</p>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton color="neutral" class="cursor-pointer" @click="close(false)">Cancel</UButton>
          <UButton color="error" class="cursor-pointer" @click="close(true)">Confirm</UButton>
        </div>
      </template>
  </UModal>
</template>
