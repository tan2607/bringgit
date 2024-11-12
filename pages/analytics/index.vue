<template>
  <div class="p-6 space-y-6">
    <!-- Header with date range picker -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Analytics Dashboard</h1>
      <input type="date" v-model="dateRange" />
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="text-sm text-gray-500">{{ stat.label }}</div>
        <div class="text-2xl font-bold">{{ stat.value }}</div>
        <div :class="['text-sm', stat.change > 0 ? 'text-green-500' : 'text-red-500']">
          {{ stat.change }}% vs last period
        </div>
      </UCard>
    </div>

    <!-- Charts section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Calls over time chart -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Calls Over Time</h3>
            <UButtonGroup v-model="timeGrouping" :options="timeGroupingOptions" />
          </div>
        </template>
        <!-- <line-chart :data="callsOverTimeData" :options="chartOptions" /> -->
      </UCard>

      <!-- Call outcomes chart -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Call Outcomes</h3>
            <UButton icon="i-lucide-download" variant="ghost" />
          </div>
        </template>
        <!-- <pie-chart :data="callOutcomesData" :options="chartOptions" /> -->
      </UCard>
    </div>

    <!-- Tags breakdown -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Call Tags Distribution</h3>
          <UInput icon="i-lucide-search" v-model="searchTags" placeholder="Search tags..." />
        </div>
      </template>
      <UTable :columns="tagColumns" :rows="tagData" />
    </UCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LineChart from '@/components/LineChart.vue'
import PieChart from '@/components/PieChart.vue'

const dateRange = ref([new Date(), new Date()])
const dateRanges = [
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thismonth' },
  { label: 'Custom range', value: 'custom' }
]

const stats = ref([
  { label: 'Total Calls', value: '1,234', change: 12 },
  { label: 'Connected Calls', value: '987', change: 5 },
  { label: 'Average Duration', value: '3m 45s', change: -2 },
  { label: 'Success Rate', value: '78%', change: 8 }
])

const timeGrouping = ref('daily')
const timeGroupingOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

const searchTags = ref('')
const tagColumns = [
  { id:1, key: 'tag', label: 'Tag' },
  { id:2, key: 'count', label: 'Count' },
  { id:3, key: 'percentage', label: 'Percentage' }
]
const tagData = ref([
  { tag: 'Already Called', count: 245, percentage: '19.8%' },
  { tag: 'Busy/Call Back Later', count: 189, percentage: '15.3%' },
  { tag: 'No Response', count: 156, percentage: '12.6%' },
  { tag: 'Wrong Number', count: 134, percentage: '10.9%' },
  { tag: 'Successfully Connected', count: 510, percentage: '41.4%' }
])

const callsOverTimeData = ref(null)
const callOutcomesData = ref(null)
const isLoading = ref(false)
const error = ref(null)

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Chart Title'
    }
  }
})

onMounted(async () => {
  isLoading.value = true
  try {
    const { getCallsOverTime, getCallOutcomes } = useApi()
    callsOverTimeData.value = await getCallsOverTime(dateRange.value)
    callOutcomesData.value = await getCallOutcomes(dateRange.value)
  } catch (e) {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Add styles for the analytics dashboard page */
</style>
