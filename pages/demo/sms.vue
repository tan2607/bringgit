<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-message-square" class="text-primary" />
          <h3 class="text-xl font-semibold">SMS Sender</h3>
        </div>
      </template>

      <SmsTask />
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import SmsTask from '~/components/SmsTask.vue'
</script>
