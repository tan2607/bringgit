<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <UContainer class="py-8">
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Welcome Back!</h1>
            <UButton color="primary" icon="i-lucide-phone-call">
              New Call
            </UButton>

            <div class="flex min-h-64 items-center justify-center">
              <RainbowButton> New AI Call </RainbowButton>
            </div>
          </div>
        </template>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UCard v-for="stat in stats" :key="stat.id">
            <div class="text-center">
              <div class="text-sm text-gray-600">{{ stat.label }}</div>
              <div class="text-2xl font-bold text-primary">{{ stat.value }}</div>
            </div>
          </UCard>
        </div>
      </UCard>

      <!-- Recent Calls Section -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Recent Calls</h2>
            <UButton variant="ghost" to="/calls">View All</UButton>
          </div>
        </template>
        <UTable :rows="recentCalls" :columns="columns" />
      </UCard>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard>
          <template #header>
            <h3 class="font-medium">Schedule Calls</h3>
          </template>
          <p class="text-sm text-gray-600">Create and manage outbound call schedules</p>
          <template #footer>
            <UButton block variant="soft" to="/schedule">
              Schedule Now
            </UButton>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-medium">Analytics</h3>
          </template>
          <p class="text-sm text-gray-600">View detailed call analytics and reports</p>
          <template #footer>
            <UButton block variant="soft" to="/analytics">
              View Analytics
            </UButton>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-medium">Call Recordings</h3>
          </template>
          <p class="text-sm text-gray-600">Access and download call recordings</p>
          <template #footer>
            <UButton block variant="soft" to="/recordings">
              Browse Recordings
            </UButton>
          </template>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
const columns = [
  {
    id:1,
    key: 'date',
    label: 'Date & Time'
  },
  {
    id:2,
    key: 'phoneNumber',
    label: 'Phone Number'
  },
  {
    id:3,
    key: 'duration',
    label: 'Duration'
  },
  {
    id:4,
    key: 'status',
    label: 'Status'
  }
]

const recentCalls = [
  {
    id:1,
    date: '2024-03-20 14:30',
    phoneNumber: '+1 (555) 123-4567',
    duration: '5:23',
    status: 'Completed'
  },
  {
    id:2,
    date: '2024-03-20 14:15',
    phoneNumber: '+1 (555) 987-6543',
    duration: '3:45',
    status: 'Completed'
  },
  {
    id:3,
    date: '2024-03-20 14:00',
    phoneNumber: '+1 (555) 456-7890',
    duration: '0:00',
    status: 'Failed'
  }
]

const stats = [
  { id: 1, label: 'Total Calls Today', value: 124 },
  { id: 2, label: 'Active Calls', value: 8 },
  { id: 3, label: 'Avg. Call Duration', value: '5:23' },
  { id: 4, label: 'Success Rate', value: '94%' }
]
</script>

<style scoped>
  /* Add your styles here */
</style>