<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <UContainer class="py-8">
      <UCard class="mb-8">
        <template #header>
           <!-- Stats Header -->
          <div v-if="timeRangeInfo">
            <span class="font-medium">{{ t('statistics-for') }}: </span>
            <span class="text-lg font-semibold">{{ formatTimeRange(timeRangeInfo) }}</span>
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
          <UCard v-for="stat in stats" :key="stat.label">
            <div class="p-4">
              <div class="text-sm text-gray-500">{{ stat.label }}</div>
              <div v-if="analyticsLoading" class="animate-pulse">
                <div class="h-8 w-24 bg-gray-200 rounded my-1"></div>
                <div class="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <template v-else>
                <div class="text-2xl font-bold">{{ stat.value }}</div>
                <div :class="['text-sm', stat.change > 0 ? 'text-green-500' : 'text-red-500']">
                  {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}% {{ t('vs-last-period') }}
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
            <h3 class="font-medium">{{ t('call-scheduling') }}</h3>
          </template>
          <p class="text-sm text-gray-600">{{ t('manage-outbound') }}</p>
          <template #footer>
            <UButton block variant="soft" to="/scheduling">
              {{ t('schedule-now') }}
            </UButton>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-medium">{{ t('analytics') }}</h3>
          </template>
          <p class="text-sm text-gray-600">{{ t('review-statistics') }}</p>
          <template #footer>
            <UButton block variant="soft" to="/analytics">
              {{ t('view-analytics') }}
            </UButton>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-medium">{{ t('call-recordings') }}</h3>
          </template>
          <p class="text-sm text-gray-600">{{ t('access-recordings') }}</p>
          <template #footer>
            <UButton block variant="soft" to="/calls">
              {{ t('browse-recordings') }}
            </UButton>
          </template>
        </UCard>
      </div>

      <!-- Recent Calls Section -->

      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">{{ t('recent-calls') }}</h2>
            <UButton variant="ghost" to="/calls">{{ t('view-all') }}</UButton>
          </div>
        </template>
        <CallTable :data="calls.slice(0, 5)" compact />
      </UCard>

    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
definePageMeta({ middleware: "auth" })
import { useAnalytics } from '@/composables/useAnalytics'
import { useCalls } from '@/composables/useCalls'
import { formatTimeRange } from '@/utils/dateFormat'
import CallTable from '@/components/CallTable.vue'

const { t } = useI18n()

const { calls, isLoading: callsLoading, fetchCalls } = useCalls()
const { 
  timeRangeInfo, 
  stats, 
  isLoading: analyticsLoading, 
  fetchAnalytics 
} = useAnalytics()

onMounted(async () => {
  await fetchCalls()
  await fetchAnalytics()
})
</script>

<style scoped>
/* Add your styles here */
</style>