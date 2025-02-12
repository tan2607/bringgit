<!-- components/JobDetailsSlideover.vue -->
<template>
  <USlideover v-model="modelValue">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-document-text" class="h-5 w-5" />
        <h3 class="text-lg font-semibold">Job Details</h3>
      </div>
    </template>

    <template #default>
      <div v-if="job" class="space-y-6 p-4">
        <!-- Job Info -->
        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-500">Job Name</h4>
            <p class="mt-1">{{ job.name }}</p>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-500">Schedule</h4>
            <p class="mt-1">{{ formatDate(job.schedule) }}</p>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-500">Status</h4>
            <div class="mt-1 flex items-center gap-2">
              <UBadge
                :color="getStatusColor(job.status)"
                :label="job.status"
                :icon="getJobIcon(job.status)"
              />
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-500">Progress</h4>
            <div class="mt-1">
              <UProgress
                :value="job.progress"
                :color="getProgressColor(job)"
                size="sm"
              />
              <p class="mt-1 text-sm text-gray-500">
                {{ job.progress }}% complete
              </p>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-500">Phone Numbers</h4>
            <div class="mt-1 space-y-1">
              <p v-for="number in job.phoneNumbers" :key="number" class="text-sm">
                {{ number }}
              </p>
            </div>
          </div>
        </div>

        <!-- Activity -->
        <div class="space-y-2">
          <h4 class="font-medium">Activity</h4>
          <div class="space-y-4">
            <UCard v-for="activity in getJobActivity(job)" :key="activity.id" class="flex gap-3 p-3">
              <UIcon :name="activity.icon" class="h-5 w-5 text-gray-400" />
              <div class="flex-1 space-y-1">
                <p class="text-sm">{{ activity.message }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.timestamp) }}</p>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Job } from '~/types'

const props = defineProps<{
  modelValue: boolean
  job?: Job | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Utility functions
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

const getJobIcon = (status: string) => {
  switch (status) {
    case 'running':
      return 'i-heroicons-play'
    case 'paused':
      return 'i-heroicons-pause'
    case 'completed':
      return 'i-heroicons-check'
    case 'failed':
      return 'i-heroicons-x-circle'
    default:
      return 'i-heroicons-clock'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'primary'
    case 'paused':
      return 'yellow'
    case 'completed':
      return 'green'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

const getProgressColor = (job: Job) => {
  if (job.status === 'failed') return 'red'
  if (job.status === 'completed') return 'green'
  return 'primary'
}

const getJobActivity = (job: Job) => {
  // Mock activity data - replace with real data
  return [
    {
      id: 1,
      icon: 'i-heroicons-play',
      message: 'Job started',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      icon: 'i-heroicons-phone',
      message: '5 calls completed',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]
}
</script>
