<template>
  <UContainer class="p-4">
    <UCard>
      <!-- Time range display -->
      <template #header>
        <!-- Stats Header -->
        <!-- Header with date range picker -->
        <div v-if="timeRangeInfo">
          <span class="font-medium">{{ t('statistics-for') }}: </span>
          <span class="text-lg font-semibold">{{ formatTimeRange(timeRangeInfo) }}</span>
        </div>

        <USelect
          v-model="dateRange"
          :items="[
            { label: 'Date', value: 'date' }
          ]"
          class="w-40"
        />
        <UInput
          v-model="dateRangeValue"
          icon="i-heroicons-calendar"
          placeholder="01/11/2024 - 30/11/2024"
          readonly
          class="w-64"
          @click="showDatePicker = true"
        />
        <USelect
          v-model="selectedTask"
          placeholder="Please select dialogue/ task name"
          :items="taskOptions"
          class="flex-1"
        />
        <USelect
          v-model="contactNumber"
          :items="[
            { label: 'Contact Number', value: 'contact' }
          ]"
          class="w-64"
        />
        <UButton icon="i-heroicons-arrows-right-left" variant="ghost" class="shrink-0" />
      </template>

      <!-- Metric cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- Total Contacts -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Total Contacts <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.totalContacts }}</div>
            </div>
            <UIcon name="i-heroicons-phone" class="text-blue-500 text-xl" />
          </div>
        </UCard>

        <!-- Answered Contacts -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Answered Contacts <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.answeredContacts }}</div>
            </div>
            <UIcon name="i-heroicons-phone" class="text-emerald-500 text-xl" />
          </div>
        </UCard>

        <!-- Touch Rate -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Touch Rate <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.touchRate }}%</div>
            </div>
            <UIcon name="i-heroicons-phone" class="text-emerald-500 text-xl" />
          </div>
        </UCard>

        <!-- Not Answered Contacts -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Not Answered Contacts <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.notAnsweredContacts }}</div>
            </div>
            <UIcon name="i-heroicons-phone-x-mark" class="text-red-500 text-xl" />
          </div>
        </UCard>
      </div>

      <!-- Second row of metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- Answering Machine -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Answering Machine <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.answeringMachine }}</div>
            </div>
            <UIcon name="i-heroicons-device-phone-mobile" class="text-purple-500 text-xl" />
          </div>
        </UCard>

        <!-- DNC -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">DNC <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.dnc }}</div>
            </div>
            <div class="text-orange-500 font-bold">DNC</div>
          </div>
        </UCard>

        <!-- Total Call Duration -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Total Call Duration <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.totalCallDuration }}</div>
            </div>
            <UIcon name="i-heroicons-clock" class="text-blue-500 text-xl" />
          </div>
        </UCard>

        <!-- Average Call Duration -->
        <UCard class="relative">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-gray-500 mb-1">Average Call Duration <UIcon name="i-heroicons-information-circle" class="inline-block" /></div>
              <div class="text-2xl font-semibold">{{ stats.averageCallDuration }}</div>
            </div>
            <UIcon name="i-heroicons-clock" class="text-blue-500 text-xl" />
          </div>
        </UCard>
      </div>
    
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

// Date range picker
const dateRange = ref('date')
const dateRangeValue = ref('01/11/2024 - 30/11/2024')
const showDatePicker = ref(false)

// Task selection
const selectedTask = ref('')
const taskOptions = ref([] as string[])
const contactNumber = ref('')

// Stats data structure
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

stats.value = Object.assign(stats.value, {
  totalContacts: '12,583',
  answeredContacts: '3,038',
  touchRate: '24.1',
  notAnsweredContacts: '9,545',
  answeringMachine: '397',
  dnc: '1,750',
  totalCallDuration: '22:21:31',
  averageCallDuration: '00:00:26'
})

onMounted(async () => {
  await fetchAnalytics()
})
</script>

<style scoped>
/* Add styles for the analytics dashboard page */
</style>
