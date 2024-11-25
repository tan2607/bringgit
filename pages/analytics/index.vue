<template>
  <UContainer class="p-4">
    <UCard>
      <!-- Time range display -->
      <template #header>
        <!-- Stats Header -->
        <!-- Header with date range picker -->
    
        {{ t('analytics-dashboard') }}
        <div v-if="timeRangeInfo">
          <span class="font-medium">{{ t('statistics-for') }}: </span>
          <span class="text-lg font-semibold">{{ formatTimeRange(timeRangeInfo) }}</span>
        </div>
      </template>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <UCard v-for="stat in stats" :key="stat.label">
          <div class="text-sm text-gray-500">{{ stat.label }}</div>
          <div v-if="analyticsLoading" class="animate-pulse">
            <div class="h-8 w-24 bg-gray-200 rounded my-1"></div>
            <div class="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <template v-else>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <div :class="['text-sm', stat.change > 0 ? 'text-green-500' : 'text-red-500']">
              {{ stat.change }}% {{ t('vs-last-period') }}
            </div>
          </template>
        </UCard>
      </div>

      <!-- Calls over time chart -->
      <UCard class="w-full mb-8">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">{{ t('calls-over-time') }}</h3>
            <UButtonGroup v-model="timeGrouping" :options="timeGroupingOptions"
              @update:model-value="updateTimeGrouping" />
          </div>
        </template>
        <LineChart :data="callsOverTimeData" :options="chartOptions" />
      </UCard>
      
      <!-- Charts section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">


        <!-- Call outcomes chart -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex justify-between items-center pb-4">
              <h3 class="text-lg font-medium">{{ t('call-outcomes') }}</h3>
              <UButton icon="i-lucide-download" variant="ghost" :aria-label="t('download')" />
            </div>
          </template>
          <div class="h-[400px]">
            <PieChart :data="callOutcomesData" :options="chartOptions" />
          </div>
        </UCard>


        <!-- Tags breakdown -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex justify-between items-center pb-4">
              <h3 class="text-lg font-medium">{{ t('call-tags-distribution') }}</h3>
              <UButton icon="i-lucide-download" variant="ghost" :aria-label="t('download')" />
            </div>
          </template>
          <div class="h-[400px]">
            <PieChart :data="tagChartData" :options="chartOptions" />
          </div>
        </UCard>
      </div>


    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
definePageMeta({ middleware: "auth" })

import { useAnalytics } from '@/composables/useAnalytics'
import { formatTimeRange } from '@/utils/dateFormat'
import LineChart from '@/components/LineChart.vue'
import PieChart from '@/components/PieChart.vue'

const { t } = useI18n()

const { 
  timeRangeInfo, 
  stats, 
  callsOverTimeData,
  callOutcomesData,
  tagChartData,
  timeGrouping,
  timeGroupingOptions,
  chartOptions,
  isLoading: analyticsLoading,
  fetchAnalytics,
  updateTimeGrouping
} = useAnalytics()

onMounted(async () => {
  await fetchAnalytics()
})
</script>

<style scoped>
/* Add styles for the analytics dashboard page */
</style>
