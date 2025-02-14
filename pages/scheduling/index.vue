<template>
  <div class="p-6">
    <UContainer>
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Job Management</h1>
        <p class="text-gray-500">Create and manage scheduled jobs</p>

        <!-- <a href="/scheduling/jobs" class="inline-block">
          <UButton icon="i-lucide-plus" color="success">
            Schedule Calling Job
          </UButton>
        </a> -->
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar Section -->
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Calendar View</h2>
              <UButton icon="i-lucide-plus" color="success" @click="openSlideover">
                Schedule Calling Job
              </UButton>
            </div>
          </template>
          <UCalendar 
            v-model="state.selectedDate" 
            :events="calendarEvents" 
            :is-date-disabled="isDateDisabled"
            class="w-full" 
            @change="handleDateChange" 
          />
        </UCard>

        <!-- Job List Section -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Jobs</h2>
              <USelect v-model="jobState.selectedStatus" :items="statusOptions" placeholder="All Status" size="sm" />
            </div>
          </template>

          <div class="space-y-4">
            <div v-for="job in filteredJobs" :key="job.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-medium">{{ job.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(job.schedule) }}</div>
                </div>
                <UBadge :color="getStatusColor(job.status)" size="sm" variant="subtle">
                  {{ job.status }}
                </UBadge>
              </div>

              <div class="flex items-center gap-2 mb-2">
                <UProgress :value="job.progress" :color="getStatusColor(job.status)" size="xs" class="flex-1" />
                <span class="text-sm text-gray-600">{{ job.progress }}%</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">{{ job.completedCalls }}/{{ job.totalCalls }} calls</span>
                <div class="flex gap-1">
                  <UButton v-if="job.status === 'running'" color="warning" variant="soft" icon="i-lucide-pause"
                    size="xs" @click="pauseJob(job.id)" :loading="job.id === jobState.loadingJobId" />
                  <UButton v-if="job.status === 'paused'" color="success" variant="soft" icon="i-lucide-play" size="xs"
                    @click="resumeJob(job.id)" :loading="job.id === jobState.loadingJobId" />
                  <UButton v-if="['running', 'paused'].includes(job.status)" color="error" variant="soft"
                    icon="i-lucide-stop" size="xs" @click="stopJob(job.id)" :loading="job.id === jobState.loadingJobId" />
                  <UDropdownMenu :items="getJobActions(job)" :popper="{ placement: 'bottom-end' }">
                    <UButton color="gray" variant="ghost" icon="i-lucide-more-vertical" size="xs" />
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarDate, today } from '@internationalized/date'
import type { Matcher } from '#ui/types'
import { useJobState } from '@/composables/useJobState'
import type { Job } from '@/composables/useJobState'
import { useState } from '#app'
import SchedulingSlideover from '~/components/SchedulingSlideover.vue'

const slideover = useSlideover()

const openSlideover = () => {
  slideover.open(SchedulingSlideover, {
    selectedDate: state.value.selectedDate
  })
}

const { jobState, startJob, pauseJob, resumeJob, stopJob, getJobs } = useJobState()

const currentDate = new Date()
const currentDateCalendar = new CalendarDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
const selectedDate = ref(currentDateCalendar)

const state = useState('scheduling', () => ({
  jobs: [] as Job[],
  statusFilter: '',
  selectedDate: currentDateCalendar,
  loadingJobId: null as string | null,
}))


// Update jobState when selectedDate changes
watch(selectedDate, (newDate) => {
  jobState.value.selectedDate = new Date(newDate.year, newDate.month - 1, newDate.day)
})
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Running', value: 'running' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
]

const calendarEvents = computed(() =>
  jobState.value.jobs.map(job => ({
    date: job.schedule,
    title: job.name,
    color: getStatusColor(job.status)
  }))
)

const filteredJobs = computed(() => {
  let jobs = [...jobState.value.jobs]
  if (jobState.value.selectedStatus) {
    jobs = jobs.filter(job => job.status === jobState.value.selectedStatus)
  }
  return jobs
})

function getStatusColor(status: string): string {
  switch (status) {
    case 'running': return 'success'
    case 'paused': return 'warning'
    case 'failed': return 'error'
    case 'completed': return 'success'
    default: return 'neutral'
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
}

function getJobActions(job: Job) {
  return [
    {
      label: 'View Details',
      icon: 'i-lucide-info',
      click: () => showJobDetails(job)
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash',
      click: () => deleteJob(job.id)
    }
  ]
}

function handleDateChange(date: CalendarDate) {
  selectedDate.value = date
  // Update jobState.selectedDate is handled by the watcher
}

function showJobDetails(job: Job) {
  // Implement job details view
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    state.value.contacts = file
  }
}
onMounted(async () => {
  const jobs = await getJobs()
  state.value.jobs = jobs

})
</script>
