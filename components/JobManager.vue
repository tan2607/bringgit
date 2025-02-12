<template>
  <div class="space-y-6">
    <!-- Top Actions Bar -->
    <div class="flex justify-between items-center">
      <div class="flex gap-2">
        <UInput v-model="localState.searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Search jobs..."
          color="gray" trailing class="w-64" />
        <USelect v-model="jobState.selectedStatus" :items="statusOptions" placeholder="Status" color="gray"
          class="w-40" />
      </div>

      <div class="flex gap-2">
        <UButton icon="i-heroicons-bookmark" @click="saveCurrentView" variant="soft" color="primary">
          Save View
        </UButton>
        <UDropdownMenu :items="savedViewItems" :ui="{ content: 'w-48' }">
          <UButton icon="i-heroicons-squares-2x2" variant="soft" color="gray">
            Saved Views
          </UButton>
        </UDropdownMenu>
        <UButton icon="i-heroicons-plus" @click="showCreateModal = true" color="primary">
          New Job
        </UButton>
      </div>
    </div>

    <!-- Bulk Actions -->
    <!-- <UCard
      v-if="jobState.value.selectedJobs.length > 0"
      class="bg-gray-50 dark:bg-gray-800"
    >
      <div class="flex gap-2 items-center">
        <UBadge color="gray" size="lg" class="mr-2">
          {{ jobState.value.selectedJobs.length }} jobs selected
        </UBadge>
        <UButton
          icon="i-heroicons-play"
          @click="bulkStart"
          variant="soft"
          color="success"
          size="sm"
        >
          Start
        </UButton>
        <UButton
          icon="i-heroicons-pause"
          @click="bulkPause"
          variant="soft"
          color="warning"
          size="sm"
        >
          Pause
        </UButton>
        <UButton
          icon="i-heroicons-trash"
          @click="bulkDelete"
          variant="soft"
          color="red"
          size="sm"
        >
          Delete
        </UButton>
      </div>
    </UCard> -->

    <!-- Jobs Table -->
    <UTable :rows="filteredJobs" :columns="columns" :sort="sort" @update:sort="sort = $event"
      v-model:selected="jobState.selectedJobs" :loading="isLoading"
      :empty-jobState="{ icon: 'i-heroicons-clipboard', label: 'No jobs found' }" selectable>
      <!-- Name Column -->
      <template #name-data="{ row }">
        <div class="flex items-center gap-2">
          <UIcon :name="getJobIcon(row.status)" class="flex-shrink-0" />
          <div>
            <div class="font-medium">{{ row.name }}</div>
            <div class="text-sm text-gray-500">{{ formatDate(row.schedule) }}</div>
          </div>
        </div>
      </template>

      <!-- Progress Column -->
      <template #progress-data="{ row }">
        <div class="w-full">
          <UProgress :value="row.progress" :color="getProgressColor(row)" class="w-32" size="sm" />
          <div class="text-xs text-gray-500 mt-1">
            {{ row.completedCalls }}/{{ row.totalCalls }} calls
          </div>
        </div>
      </template>

      <!-- Status Column -->
      <template #status-data="{ row }">
        <UBadge :color="getStatusColor(row.status)" size="sm" variant="soft">
          {{ row.status }}
        </UBadge>
      </template>

      <!-- Actions Column -->
      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UDropdownMenu :items="getJobActions(row)" @select="handleJobAction($event, row)" :ui="{
            popper: { placement: 'bottom-end' },
            content: 'w-40'
          }">
            <UButton icon="i-heroicons-ellipsis-vertical" color="gray" variant="ghost" size="xs" />
          </UDropdownMenu>
        </div>
      </template>

      <!-- Loading State -->
      <template #loading-jobState>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-400" />
          <p class="text-sm text-gray-500">Loading jobs...</p>
        </div>
      </template>
    </UTable>

    <!-- Create/Edit Job Modal -->
    <JobFormModal v-model="showCreateModal" :editing-job="editingJob" :assistant-options="assistantOptions"
      :phone-number-options="phoneNumberOptions" @submit="handleJobSubmit" />

    <!-- Quick View Drawer -->
    <USlideover v-model="showQuickView">
      <template #content>


        <UCard class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                {{ quickViewJob?.name }}
              </h3>
              <UButton icon="i-lucide-x" color="gray" variant="ghost" @click="showQuickView = false" />
            </div>
          </template>

          <div v-if="quickViewJob" class="space-y-6">
            <!-- Progress Section -->
            <div class="space-y-2">
              <h4 class="font-medium">Progress</h4>
              <UProgress :value="quickViewJob.progress" :color="getProgressColor(quickViewJob)" size="lg" />
              <div class="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <div class="text-sm text-gray-500">Total</div>
                  <div class="font-medium">{{ quickViewJob.totalCalls }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">Completed</div>
                  <div class="font-medium">{{ quickViewJob.completedCalls }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">Failed</div>
                  <div class="font-medium">{{ quickViewJob.failedCalls }}</div>
                </div>
              </div>
            </div>

            <!-- Failed Numbers -->
            <div v-if="quickViewJob.failedNumbers?.length > 0">
              <h4 class="font-medium mb-2">Failed Numbers</h4>
              <UCard class="bg-gray-50">
                <div class="space-y-1">
                  <div v-for="number in quickViewJob.failedNumbers" :key="number" class="text-sm">
                    {{ number }}
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Recent Activity -->
            <div>
              <h4 class="font-medium mb-2">Recent Activity</h4>
              <div class="space-y-3">
                <UCard v-for="activity in getJobActivity(quickViewJob)" :key="activity.id" class="flex gap-3 p-3">
                  <UIcon :name="activity.icon" class="h-5 w-5 text-gray-400" />
                  <div class="flex-1 space-y-1">
                    <p class="text-sm">{{ activity.message }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(activity.timestamp) }}</p>
                  </div>
                </UCard>
              </div>
            </div>
          </div>
        </UCard>

      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Job } from '~/types'
import { z } from 'zod'
import { useJobState } from '@/composables/useJobState'
import JobFormModal from './JobFormModal.vue'
import JobDetailsSlideover from './JobDetailsSlideover.vue'

// Form validation schema
const jobFormSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  schedule: z.date().min(new Date(), 'Schedule must be in the future'),
  phoneNumbers: z.string().min(1, 'At least one phone number is required'),
  assistantId: z.string().min(1, 'Assistant is required'),
  phoneNumberId: z.string().min(1, 'Phone number is required')
})

type JobFormSchema = z.output<typeof jobFormSchema>

const { jobState, createJob, pauseJob, resumeJob, stopJob } = useJobState()

// Local UI jobState
const localState = useState('jobManagerUI', () => ({
  searchQuery: '',
  savedViews: []
}))

// Convert saved views to dropdown menu items
const savedViewItems = computed(() => {
  return localState.value.savedViews?.map(view => ({
    label: view.name,
    icon: 'i-heroicons-bookmark',
    onSelect: () => loadView(view)
  })) || []
})

// State
const showCreateModal = ref(false)
const showQuickView = ref(false)
const isSubmitting = ref(false)
const editingJob = ref<Job | null>(null)
const quickViewJob = ref<Job | null>(null)
const sort = ref({ column: 'schedule', direction: 'desc' })

// Form jobState
const jobForm = ref({
  name: '',
  schedule: new Date(),
  phoneNumbers: '',
  assistantId: '',
  phoneNumberId: ''
})

// Mock data (replace with real data)
const assistantOptions = [
  { label: 'Sales Assistant', value: 'sales-1' },
  { label: 'Support Assistant', value: 'support-1' }
]

const phoneNumberOptions = [
  { label: '+1 (555) 0123', value: 'number-1' },
  { label: '+1 (555) 0124', value: 'number-2' }
]

const savedViews = [
  { label: 'All Active Jobs', key: 'active' },
  { label: 'Failed Jobs', key: 'failed' },
  { label: 'Today\'s Jobs', key: 'today' }
]

// Table configuration
const columns = [
  { accessorKey: 'name', header: 'Name', sortable: true },
  { accessorKey: 'progress', header: 'Progress', sortable: true },
  { accessorKey: 'status', header: 'Status', sortable: true },
  { accessorKey: 'actions', header: '' }
]

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Running', value: 'running' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
]

// Computed
const filteredJobs = computed(() => {
  let jobs = [...jobState.value.jobs]

  // Apply search
  if (localState.value.searchQuery) {
    jobs = jobs.filter(job =>
      job.name.toLowerCase().includes(localState.value.searchQuery.toLowerCase())
    )
  }

  // Apply status filter
  if (jobState.value.selectedStatus) {
    jobs = jobs.filter(job => job.status === jobState.value.selectedStatus)
  }

  return jobs
})

// Methods
const getJobIcon = (status: string) => {
  switch (status) {
    case 'running': return 'i-lucide-play'
    case 'paused': return 'i-lucide-pause'
    case 'completed': return 'i-lucide-check'
    case 'failed': return 'i-lucide-x'
    default: return 'i-lucide-clock'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'success'
    case 'paused': return 'warning'
    case 'completed': return 'success'
    case 'failed': return 'error'
    default: return 'gray'
  }
}

const getProgressColor = (job: Job) => {
  if (job.status === 'failed') return 'error'
  if (job.status === 'paused') return 'warning'
  return 'success'
}

const formatDate = (date: Date) => {
  return DateTime.fromJSDate(date).toFormat('dd LLL yyyy HH:mm')
}

const getPhoneNumberCount = () => {
  return jobForm.value.phoneNumbers.split('\n')
    .filter(n => n.trim()).filter(Boolean).length
}

const getJobActions = (job: Job) => {
  const actions = [
    {
      label: 'Quick View',
      icon: 'i-heroicons-eye',
      onSelect: () => handleJobAction('view', job)
    },
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => handleJobAction('edit', job)
    }
  ]

  // Add status-based actions
  if (job.status === 'pending' || job.status === 'paused') {
    actions.push({
      label: 'Start',
      icon: 'i-heroicons-play',
      color: 'success',
      onSelect: () => handleJobAction('start', job)
    })
  } else if (job.status === 'running') {
    actions.push({
      label: 'Pause',
      icon: 'i-heroicons-pause',
      color: 'warning',
      onSelect: () => handleJobAction('pause', job)
    })
  }

  // Add separator before destructive action
  actions.push({ type: 'separator' })

  // Add delete action
  actions.push({
    label: 'Delete',
    icon: 'i-heroicons-trash',
    color: 'red',
    onSelect: () => handleJobAction('delete', job)
  })

  return [actions]
}

const handleJobAction = async (action: string, job: Job) => {
  switch (action) {
    case 'view':
      quickViewJob.value = job
      showQuickView.value = true
      break
    case 'edit':
      editingJob.value = job
      jobForm.value = {
        ...job,
        phoneNumbers: job.phoneNumbers.join('\n')
      }
      showCreateModal.value = true
      break
    case 'start':
      await startJob(job.id)
      break
    case 'pause':
      await pauseJob(job.id)
      break
    case 'delete':
      // Implement delete
      break
  }
}

const handleJobSubmit = async (event: FormSubmitEvent<JobFormSchema>) => {
  isSubmitting.value = true
  try {
    const phoneNumbers = event.data.phoneNumbers
      .split('\n')
      .map(n => n.trim())
      .filter(Boolean)

    const jobData = {
      ...event.data,
      phoneNumbers
    }

    if (editingJob.value) {
      // Implement edit
    } else {
      await createJob(jobData)
    }

    showCreateModal.value = false
  } finally {
    isSubmitting.value = false
  }
}

const bulkStart = async () => {
  await Promise.all(jobState.value.selectedJobs.map(job => startJob(job.id)))
  jobState.value.selectedJobs = []
}

const bulkPause = async () => {
  await Promise.all(jobState.value.selectedJobs.map(job => pauseJob(job.id)))
  jobState.value.selectedJobs = []
}

const bulkDelete = async () => {
  // Implement bulk delete
  jobState.value.selectedJobs = []
}

const saveCurrentView = () => {
  // Implement save view
}

const loadView = (view: any) => {
  switch (view.key) {
    case 'active':
      jobState.value.selectedStatus = 'running'
      break
    case 'failed':
      jobState.value.selectedStatus = 'failed'
      break
    case 'today':
      // Implement today filter
      break
  }
}

const getJobActivity = (job: Job) => {
  return [
    {
      title: `Job ${job.status}`,
      date: job.lastProcessedAt,
      icon: getJobIcon(job.status)
    },
    {
      title: `${job.completedCalls} calls completed`,
      date: new Date(),
      icon: 'i-lucide-phone'
    },
    {
      title: `${job.failedCalls} calls failed`,
      date: new Date(),
      icon: 'i-lucide-phone-off'
    }
  ]
}
</script>
