<template>
  <UContainer class="p-4">
    <UCard>
      <!-- Time range display -->
      <template #header>
        <!-- Stats Header -->
        <!-- Header with date range picker -->
    
        Analytics Dashboard
        <div v-if="analytics.timeRangeInfo">
          <span class="font-medium">Statistics for: </span>
          <span class="text-lg font-semibold">{{ formatTimeRange(analytics.timeRangeInfo) }}</span>
        </div>
      </template>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <UCard v-for="stat in analytics.stats" :key="stat.label">
          <div class="text-sm text-gray-500">{{ stat.label }}</div>
          <div v-if="analytics.isLoading" class="animate-pulse">
            <div class="h-8 w-24 bg-gray-200 rounded my-1"></div>
            <div class="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <template v-else>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <div :class="['text-sm', stat.change > 0 ? 'text-green-500' : 'text-red-500']">
              {{ stat.change }}% vs last period
            </div>
          </template>
        </UCard>
      </div>

      <!-- Calls over time chart -->
      <UCard class="w-full mb-8">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Calls Over Time</h3>
            <UButtonGroup v-model="analytics.timeGrouping" :options="analytics.timeGroupingOptions"
              @update:model-value="analytics.updateTimeGrouping" />
          </div>
        </template>
        <LineChart :data="analytics.callsOverTimeData" :options="analytics.chartOptions" />
      </UCard>
      
      <!-- Charts section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">


        <!-- Call outcomes chart -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex justify-between items-center pb-4">
              <h3 class="text-lg font-medium">Call Outcomes</h3>
              <UButton icon="i-lucide-download" variant="ghost" />
            </div>
          </template>
          <div class="h-[400px]">
            <PieChart :data="analytics.callOutcomesData" :options="analytics.chartOptions" />
          </div>
        </UCard>


        <!-- Tags breakdown -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex justify-between items-center pb-4">
              <h3 class="text-lg font-medium">Call Tags Distribution</h3>
              <UButton icon="i-lucide-download" variant="ghost" />
            </div>
          </template>
          <div class="h-[400px]">
            <PieChart :data="analytics.tagChartData" :options="analytics.tagChartOptions" />
          </div>
        </UCard>
      </div>


    </UCard>
  </UContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { formatTimeRange } from '@/utils/dateFormat'

const dateRange = ref([new Date(), new Date()])
const analytics = useAnalyticsStore()

const dateRanges = [
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thismonth' },
  { label: 'Custom range', value: 'custom' }
]

onMounted(async () => {
  await analytics.fetchAnalytics()
})
</script>

<style scoped>
/* Add styles for the analytics dashboard page */
</style>
