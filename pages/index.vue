<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <UContainer class="py-8">
      <UCard class="mb-8">
        <template #header>
           <!-- Stats Header -->
          <div v-if="analytics.timeRangeInfo">
            <span class="font-medium">Statistics for: </span>
            <span class="text-lg font-semibold">{{ formatTimeRange(analytics.timeRangeInfo) }}</span>
          </div>
        </template>

        <!-- <template #header>
          <div class="flex items-center justify-between">
            <UButton color="primary" icon="i-lucide-phone-call">
              New Call
            </UButton>

            <div class="flex min-h-64 items-center justify-center">
              <RainbowButton> New AI Call </RainbowButton>
            </div>
          </div>
        </template> -->

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UCard v-for="stat in analytics.stats" :key="stat.label">
            <div class="p-4">
              <div class="text-sm text-gray-500">{{ stat.label }}</div>
              <div v-if="analytics.isLoading" class="animate-pulse">
                <div class="h-8 w-24 bg-gray-200 rounded my-1"></div>
                <div class="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <template v-else>
                <div class="text-2xl font-bold">{{ stat.value }}</div>
                <div :class="['text-sm', stat.change > 0 ? 'text-green-500' : 'text-red-500']">
                  {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}% vs last period
                </div>
              </template>
            </div>
          </UCard>
        </div>
      </UCard>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <UCard>
          <template #header>
            <h3 class="font-medium">Schedule Calls</h3>
          </template>
          <p class="text-sm text-gray-600">Create and manage outbound call schedules</p>
          <template #footer>
            <UButton block variant="soft" to="/scheduling">
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
            <UButton block variant="soft" to="/calls">
              Browse Recordings
            </UButton>
          </template>
        </UCard>
      </div>

      <!-- Recent Calls Section -->

      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Recent Calls</h2>
            <UButton variant="ghost" to="/calls">View All</UButton>
          </div>
        </template>
        <CallTable :data="recentCalls" compact />
      </UCard>

    </UContainer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useCallsStore } from '@/stores/calls'
import { formatTimeRange } from '@/utils/dateFormat'
import CallTable from '@/components/CallTable.vue'

const analytics = useAnalyticsStore()
const callsStore = useCallsStore()

const recentCalls = computed(() =>
  callsStore.calls.slice(0, 5)  // Only show last 5 calls
)

// Fetch both analytics and calls data when component mounts
onMounted(async () => {
  await Promise.all([
    analytics.fetchAnalytics(),
    callsStore.fetchCalls()
  ])
})

</script>

<style scoped>
/* Add your styles here */
</style>