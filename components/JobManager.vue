<template>
  <div class="space-y-6">
    <!-- Top Actions Bar -->
    <div class="flex justify-between items-center">
      <div class="flex gap-2">
        <UInput
          v-model="state.searchQuery"
          icon="i-lucide-search"
          placeholder="Search jobs..."
          class="w-64"
        />
        <USelect
          v-model="state.selectedStatus"
          :options="statusOptions"
          placeholder="Status"
          class="w-40"
        />
      </div>
      
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-save"
          @click="saveCurrentView"
          variant="ghost"
          color="success"
        >
          Save View
        </UButton>
        <UDropdown :items="state.savedViews" @select="loadView">
          <UButton icon="i-lucide-layout" variant="ghost" color="gray">
            Saved Views
          </UButton>
        </UDropdown>
        <UButton
          icon="i-lucide-plus"
          @click="showCreateModal = true"
          color="primary"
        >
          New Job
        </UButton>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="state.selectedJobs.length > 0" class="flex gap-2 items-center bg-gray-50 p-4 rounded-lg">
      <span class="text-sm text-gray-600">{{ state.selectedJobs.length }} jobs selected</span>
      <UButton
        icon="i-lucide-play"
        @click="bulkStart"
        variant="ghost"
        color="success"
      >
        Start
      </UButton>
      <UButton
        icon="i-lucide-pause"
        @click="bulkPause"
        variant="ghost"
        color="warning"
      >
        Pause
      </UButton>
      <UButton
        icon="i-lucide-trash"
        @click="bulkDelete"
        variant="ghost"
        color="error"
      >
        Delete
      </UButton>
    </div>

    <!-- Jobs Table -->
    <UTable
      :rows="filteredJobs"
      :columns="columns"
      :sort="sort"
      @update:sort="sort = $event"
      v-model:selected="state.selectedJobs"
      selectable
    >
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
          <UProgress
            :value="row.progress"
            :color="getProgressColor(row)"
            class="w-32"
          />
          <div class="text-xs text-gray-500 mt-1">
            {{ row.completedCalls }}/{{ row.totalCalls }} calls
          </div>
        </div>
      </template>

      <!-- Status Column -->
      <template #status-data="{ row }">
        <UBadge :color="getStatusColor(row.status)">
          {{ row.status }}
        </UBadge>
      </template>

      <!-- Actions Column -->
      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UDropdown
            :items="getJobActions(row)"
            @select="handleJobAction($event, row)"
          >
            <UButton
              icon="i-lucide-more-vertical"
              color="gray"
              variant="ghost"
              size="xs"
            />
          </UDropdown>
        </div>
      </template>
    </UTable>

    <!-- Create/Edit Job Modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingJob ? 'Edit Job' : 'Create New Job' }}
          </h3>
        </template>

        <form @submit.prevent="handleJobSubmit" class="space-y-4">
          <UFormGroup label="Job Name" required>
            <UInput
              v-model="jobForm.name"
              placeholder="Enter job name"
              required
            />
          </UFormGroup>

          <UFormGroup label="Schedule" required>
            <UDatePicker
              v-model="jobForm.schedule"
              :min="new Date()"
              required
            />
          </UFormGroup>

          <UFormGroup label="Phone Numbers" required>
            <div class="space-y-2">
              <UTextarea
                v-model="jobForm.phoneNumbers"
                placeholder="Enter phone numbers (one per line)"
                rows="4"
                required
              />
              <div class="text-xs text-gray-500">
                {{ getPhoneNumberCount() }} numbers entered
              </div>
            </div>
          </UFormGroup>

          <UFormGroup label="Assistant" required>
            <USelect
              v-model="jobForm.assistantId"
              :options="assistantOptions"
              required
            />
          </UFormGroup>

          <UFormGroup label="Outbound Number" required>
            <USelect
              v-model="jobForm.phoneNumberId"
              :options="phoneNumberOptions"
              required
            />
          </UFormGroup>
        </form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="ghost"
              @click="showCreateModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="handleJobSubmit"
              :loading="isSubmitting"
            >
              {{ editingJob ? 'Save Changes' : 'Create Job' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Quick View Drawer -->
    <USlideover v-model="showQuickView">
      <UCard class="h-full">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ quickViewJob?.name }}
            </h3>
            <UButton
              icon="i-lucide-x"
              color="gray"
              variant="ghost"
              @click="showQuickView = false"
            />
          </div>
        </template>

        <div v-if="quickViewJob" class="space-y-6">
          <!-- Progress Section -->
          <div class="space-y-2">
            <h4 class="font-medium">Progress</h4>
            <UProgress
              :value="quickViewJob.progress"
              :color="getProgressColor(quickViewJob)"
              size="lg"
            />
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
                <div
                  v-for="number in quickViewJob.failedNumbers"
                  :key="number"
                  class="text-sm"
                >
                  {{ number }}
                </div>
              </div>
            </UCard>
          </div>

          <!-- Recent Activity -->
          <div>
            <h4 class="font-medium mb-2">Recent Activity</h4>
            <UTimeline :items="getJobActivity(quickViewJob)" />
          </div>
        </div>
      </UCard>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Job } from '~/types'
import { useState } from '~/composables/useState'

const state = useState('jobManager', () => ({
  searchQuery: '',
  selectedStatus: null,
  selectedJobs: [],
  savedViews: []
}))

// State
const showCreateModal = ref(false)
const showQuickView = ref(false)
const isSubmitting = ref(false)
const editingJob = ref<Job | null>(null)
const quickViewJob = ref<Job | null>(null)
const sort = ref({ column: 'schedule', direction: 'desc' })

// Form state
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
  { key: 'name', label: 'Name', sortable: true },
  { key: 'progress', label: 'Progress', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '' }
]

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Running', value: 'running' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
]

// Computed
const filteredJobs = computed(() => {
  let jobs = useJobState().state.value.jobs

  // Apply search
  if (state.searchQuery) {
    jobs = jobs.filter(job => 
      job.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    )
  }

  // Apply status filter
  if (state.selectedStatus) {
    jobs = jobs.filter(job => job.status === state.selectedStatus)
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
    .filter(n => n.trim()).length
}

const getJobActions = (job: Job) => {
  const actions = []

  actions.push({ label: 'Quick View', icon: 'i-lucide-eye', key: 'view' })
  actions.push({ label: 'Edit', icon: 'i-lucide-edit', key: 'edit' })

  switch (job.status) {
    case 'pending':
    case 'paused':
      actions.push({ label: 'Start', icon: 'i-lucide-play', key: 'start' })
      break
    case 'running':
      actions.push({ label: 'Pause', icon: 'i-lucide-pause', key: 'pause' })
      break
  }

  actions.push({ label: 'Delete', icon: 'i-lucide-trash', key: 'delete' })

  return actions
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
      await useJobState().startJob(job.id)
      break
    case 'pause':
      await useJobState().pauseJob(job.id)
      break
    case 'delete':
      // Implement delete
      break
  }
}

const handleJobSubmit = async () => {
  isSubmitting.value = true
  try {
    const phoneNumbers = jobForm.value.phoneNumbers
      .split('\n')
      .map(n => n.trim())
      .filter(Boolean)

    const jobData = {
      ...jobForm.value,
      phoneNumbers
    }

    if (editingJob.value) {
      // Implement edit
    } else {
      await useJobState().createJob(jobData)
    }

    showCreateModal.value = false
  } finally {
    isSubmitting.value = false
  }
}

const bulkStart = async () => {
  await Promise.all(state.selectedJobs.map(job => useJobState().startJob(job.id)))
  state.selectedJobs = []
}

const bulkPause = async () => {
  await Promise.all(state.selectedJobs.map(job => useJobState().pauseJob(job.id)))
  state.selectedJobs = []
}

const bulkDelete = async () => {
  // Implement bulk delete
  state.selectedJobs = []
}

const saveCurrentView = () => {
  // Implement save view
}

const loadView = (view: any) => {
  switch (view.key) {
    case 'active':
      state.selectedStatus = 'running'
      break
    case 'failed':
      state.selectedStatus = 'failed'
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
