<template>
  <div class="space-y-6">
    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Analytics Filters</h3>
          <UButton
            icon="i-lucide-refresh-cw"
            color="info"
            variant="ghost"
            :loading="isLoading"
            @click="refreshData"
          />
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Date Range -->
        <UFormGroup label="Date Range">
          <USelect
            v-model="state.filters.range"
            :options="dateRanges"
            @update:model-value="updateDateRange"
          />
        </UFormGroup>

        <!-- Status -->
        <UFormGroup label="Status">
          <USelect
            v-model="state.filters.status"
            :options="statusOptions"
            multiple
            placeholder="All Statuses"
          />
        </UFormGroup>

        <!-- Assistants -->
        <UFormGroup label="Assistants">
          <USelect
            v-model="state.filters.assistantIds"
            :options="assistantOptions"
            multiple
            placeholder="All Assistants"
          />
        </UFormGroup>

        <!-- Phone Numbers -->
        <UFormGroup label="Phone Numbers">
          <USelect
            v-model="state.filters.phoneNumberIds"
            :options="phoneNumberOptions"
            multiple
            placeholder="All Numbers"
          />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="text-center">
          <div class="text-sm text-gray-500">Total Jobs</div>
          <div class="text-2xl font-bold">{{ state.metrics.jobs }}</div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-sm text-gray-500">Total Calls</div>
          <div class="text-2xl font-bold">{{ state.metrics.totalCalls }}</div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-sm text-gray-500">Success Rate</div>
          <div class="text-2xl font-bold">
            {{ formatPercent(state.metrics.metrics.successRate) }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-sm text-gray-500">Total Cost</div>
          <div class="text-2xl font-bold">
            {{ formatCurrency(state.metrics.metrics.totalCost) }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Call Volume by Hour -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Call Volume by Hour</h3>
        </template>
        <Line
          v-if="chartData.hourly"
          :data="chartData.hourly"
          :options="chartOptions.hourly"
        />
      </UCard>

      <!-- Failure Reasons -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Failure Reasons</h3>
        </template>
        <Pie
          v-if="chartData.failures"
          :data="chartData.failures"
          :options="chartOptions.pie"
        />
      </UCard>
    </div>

    <!-- Detailed Metrics -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Detailed Metrics</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500">Average Call Duration</div>
          <div class="text-xl font-semibold">
            {{ formatDuration(state.metrics.metrics.avgCallDuration) }}
          </div>
        </div>

        <div>
          <div class="text-sm text-gray-500">Cost per Call</div>
          <div class="text-xl font-semibold">
            {{ formatCurrency(state.metrics.metrics.costPerCall) }}
          </div>
        </div>

        <div>
          <div class="text-sm text-gray-500">Average Completion Time</div>
          <div class="text-xl font-semibold">
            {{ formatDuration(state.metrics.metrics.completionTime) }}
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import type { AnalyticsFilters } from '~/server/utils/analytics'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// State
const state = useState('reportingDashboard', () => ({
  filters: {
    range: 'last7days',
    status: [],
    assistantIds: [],
    phoneNumberIds: []
  },
  metrics: {
    jobs: 0,
    totalCalls: 0,
    metrics: {
      successRate: 0,
      avgCallDuration: 0,
      peakHours: [],
      costPerCall: 0,
      failureReasons: new Map(),
      totalCost: 0,
      completionTime: 0
    }
  }
}))

const isLoading = ref(false)

// Options
const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'Custom Range', value: 'custom' }
]

const statusOptions = [
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Scheduled', value: 'scheduled' }
]

// Mock data - replace with real data
const assistantOptions = [
  { label: 'Sales Assistant', value: 'sales' },
  { label: 'Support Assistant', value: 'support' },
  { label: 'Booking Assistant', value: 'booking' }
]

const phoneNumberOptions = [
  { label: '+1 (555) 0123', value: 'phone1' },
  { label: '+1 (555) 0124', value: 'phone2' },
  { label: '+1 (555) 0125', value: 'phone3' }
]

// Chart data
const chartData = computed(() => ({
  hourly: {
    labels: state.metrics.metrics.peakHours.map(h => `${h.hour}:00`),
    datasets: [{
      label: 'Calls',
      data: state.metrics.metrics.peakHours.map(h => h.count),
      borderColor: '#3B82F6',
      backgroundColor: '#93C5FD',
      tension: 0.4
    }]
  },
  failures: {
    labels: Array.from(state.metrics.metrics.failureReasons.keys()),
    datasets: [{
      data: Array.from(state.metrics.metrics.failureReasons.values()),
      backgroundColor: [
        '#EF4444',
        '#F59E0B',
        '#10B981',
        '#6366F1'
      ]
    }]
  }
}))

const chartOptions = {
  hourly: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  },
  pie: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      }
    }
  }
}

// Methods
const updateDateRange = () => {
  const now = new Date()
  const start = new Date()

  switch (state.filters.range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      now.setDate(now.getDate() - 1)
      now.setHours(23, 59, 59, 999)
      break
    case 'last7days':
      start.setDate(start.getDate() - 7)
      break
    case 'last30days':
      start.setDate(start.getDate() - 30)
      break
  }

  state.filters.timeRange = {
    start,
    end: now
  }

  refreshData()
}

const refreshData = async () => {
  isLoading.value = true
  try {
    const analytics = useAnalytics()
    state.metrics = await analytics.getBatchMetrics(state.filters)
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
  } finally {
    isLoading.value = false
  }
}

// Formatters
const formatPercent = (value: number) => `${value.toFixed(1)}%`
const formatCurrency = (value: number) => `$${value.toFixed(2)}`
const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

// Initial load
onMounted(() => {
  updateDateRange()
})
</script>
