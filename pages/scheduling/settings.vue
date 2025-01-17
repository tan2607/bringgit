<template>
  <div class="p-6">
    <UContainer>
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Scheduling Settings</h1>
        <p class="text-gray-500">Configure job scheduling and notification preferences</p>
      </div>
      
      <div class="space-y-6">
        <ScheduleManager />
        <NotificationSettings />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// Components contain their own state management and logic
</script>
