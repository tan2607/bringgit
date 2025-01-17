<template>
  <div class="p-6">
    <UContainer>
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Job Management</h1>
        <p class="text-gray-500">Create and manage scheduled jobs</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar Section -->
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Calendar View</h2>
              <UButton 
                icon="i-lucide-plus" 
                color="success"
                @click="state.openScheduleModal = true"
              >
                Create Job
              </UButton>
            </div>
          </template>
          <UCalendar 
            v-model="state.selectedDate"
            :events="calendarEvents"
            class="w-full"
            @change="handleDateChange"
          />
        </UCard>

        <!-- Job List Section -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Jobs</h2>
              <USelect
                v-model="state.statusFilter"
                :options="statusOptions"
                placeholder="All Status"
                size="sm"
              />
            </div>
          </template>
          
          <div class="space-y-4">
            <div v-for="job in filteredJobs" :key="job.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-medium">{{ job.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(job.schedule) }}</div>
                </div>
                <UBadge
                  :color="getStatusColor(job.status)"
                  size="sm"
                  variant="subtle"
                >
                  {{ job.status }}
                </UBadge>
              </div>
              
              <div class="flex items-center gap-2 mb-2">
                <UProgress
                  :value="job.progress"
                  :color="getStatusColor(job.status)"
                  size="xs"
                  class="flex-1"
                />
                <span class="text-sm text-gray-600">{{ job.progress }}%</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">{{ job.completedCalls }}/{{ job.totalCalls }} calls</span>
                <div class="flex gap-1">
                  <UButton
                    v-if="job.status === 'running'"
                    color="warning"
                    variant="soft"
                    icon="i-lucide-pause"
                    size="xs"
                    @click="pauseJob(job.id)"
                    :loading="job.id === state.loadingJobId"
                  />
                  <UButton
                    v-if="job.status === 'paused'"
                    color="success"
                    variant="soft"
                    icon="i-lucide-play"
                    size="xs"
                    @click="resumeJob(job.id)"
                    :loading="job.id === state.loadingJobId"
                  />
                  <UButton
                    v-if="['running', 'paused'].includes(job.status)"
                    color="error"
                    variant="soft"
                    icon="i-lucide-stop"
                    size="xs"
                    @click="stopJob(job.id)"
                    :loading="job.id === state.loadingJobId"
                  />
                  <UDropdown
                    :items="getJobActions(job)"
                    :popper="{ placement: 'bottom-end' }"
                  >
                    <UButton
                      color="gray"
                      variant="ghost"
                      icon="i-lucide-more-vertical"
                      size="xs"
                    />
                  </UDropdown>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>

    <!-- Create Job Modal -->
    <UModal v-model="state.openScheduleModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New Job</h3>
        </template>
        
        <UForm 
          :schema="scheduleFormSchema"
          :state="state.newJob"
          @submit="handleCreateJob"
        >
          <UFormGroup label="Job Name" name="name">
            <UInput v-model="state.newJob.name" />
          </UFormGroup>
          
          <UFormGroup label="Schedule" name="schedule">
            <UDatePicker v-model="state.newJob.schedule" :min="new Date()" />
          </UFormGroup>
          
          <UFormGroup label="Phone Numbers" name="phoneNumbers">
            <USelect
              v-model="state.newJob.phoneNumbers"
              :options="phoneNumberOptions"
              multiple
            />
          </UFormGroup>
          
          <UFormGroup label="Assistant" name="assistantId">
            <USelect
              v-model="state.newJob.assistantId"
              :options="assistantOptions"
            />
          </UFormGroup>
          
          <UFormGroup label="Upload Contacts" name="contacts">
            <UFileInput
              accept=".csv"
              @change="handleFileUpload"
            />
          </UFormGroup>
        </UForm>
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="state.openScheduleModal = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="state.isSubmitting"
              @click="handleCreateJob"
            >
              Create Job
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Job } from '~/types'

const state = useState('scheduling', () => ({
  jobs: [] as Job[],
  selectedDate: new Date(),
  statusFilter: null,
  openScheduleModal: false,
  loadingJobId: null as string | null,
  isSubmitting: false,
  newJob: {
    name: '',
    schedule: new Date(),
    phoneNumbers: [],
    assistantId: null,
    contacts: null
  }
}))

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Running', value: 'running' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
]

const calendarEvents = computed(() => 
  state.value.jobs.map(job => ({
    date: job.schedule,
    title: job.name,
    color: getStatusColor(job.status)
  }))
)

const filteredJobs = computed(() => {
  let jobs = state.value.jobs
  if (state.value.statusFilter) {
    jobs = jobs.filter(job => job.status === state.value.statusFilter)
  }
  return jobs
})

const scheduleFormSchema = {
  name: 'required|min:3',
  schedule: 'required|date',
  phoneNumbers: 'required|array|min:1',
  assistantId: 'required',
  contacts: 'required'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'running': return 'success'
    case 'paused': return 'warning'
    case 'failed': return 'error'
    default: return 'gray'
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
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

async function handleCreateJob() {
  if (state.value.isSubmitting) return
  
  state.value.isSubmitting = true
  try {
    await createJob(state.value.newJob)
    state.value.openScheduleModal = false
  } catch (error) {
    console.error('Failed to create job:', error)
  } finally {
    state.value.isSubmitting = false
  }
}

function handleDateChange(date: Date) {
  state.value.selectedDate = date
  // Fetch jobs for the selected date
}

function showJobDetails(job: Job) {
  // Implement job details view
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    state.value.newJob.contacts = file
  }
}
</script>
