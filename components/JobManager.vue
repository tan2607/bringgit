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
        <UButton icon="i-heroicons-plus" @click="handleCreateJob" color="primary">
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
    <UTable :data="filteredJobs" :columns="columns" :sort="sort" @update:sort="sort = $event"
      v-model="selectedJobs" :loading="isLoading"
      :empty-jobState="{ icon: 'i-heroicons-clipboard', label: 'No jobs found' }" @select="handleSelectJob">
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
    <JobFormModal v-if="showCreateModal" v-model="showCreateModal" :editing-job="editingJob" :assistantOptions="assistants"
      :phone-number-options="numbers" @submit="handleJobSubmit"/>

    <!-- Quick View Drawer -->
    <JobDetailsSlideover />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Job } from '~/types'
import { z } from 'zod'
import { useJobState } from '@/composables/useJobState'
import JobFormModal from './JobFormModal.vue'
import JobDetailsSlideover from './JobDetailsSlideover.vue'


const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
// Form validation schema
const jobFormSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  schedule: z.date().min(new Date(), 'Schedule must be in the future'),
  phoneNumbers: z.string().min(1, 'At least one phone number is required'),
  assistantId: z.string().min(1, 'Assistant is required'),
  phoneNumberId: z.string().min(1, 'Phone number is required')
})

type JobFormSchema = z.output<typeof jobFormSchema>

const { jobState, createJob, pauseJob, resumeJob, stopJob, getJobs, deleteJob } = useJobState()
const { assistants, fetchAssistants } = useAssistants()
const { numbers, fetchNumbers } = usePhoneNumbers()
const { confirm } = useConfirm()
const toast = useToast()

const slideover = useSlideover()


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
const selectedJobs = ref<Job[]>([])
const isLoading = ref<bool>(false)

// Form jobState
const jobForm = ref({
  name: '',
  schedule: new Date(),
  phoneNumbers: '',
  assistantId: '',
  phoneNumberId: ''
})

// Mock data (replace with real data)

const savedViews = [
  { label: 'All Active Jobs', key: 'active' },
  { label: 'Failed Jobs', key: 'failed' },
  { label: 'Today\'s Jobs', key: 'today' }
]



// Table configuration
const columns = [
  { accessorKey: 'name', header: 'Job Name', sortable: true },
  {
    accessorKey: 'assistantId',
    header: 'Assistant Name',
    cell: ({ row }: { row:any }) => {
      const assistantId = row.getValue('assistantId');
      const assistant = assistants.value.find(a => a.id === assistantId);
      const assistantName = assistant ? assistant.name : 'N/A';

      return assistantName;
    }
  },
  {
    accessorKey: 'phoneNumberId',
    header: 'Outbound Number',
    cell: ({ row }: { row:any }) => {
      const phoneNumberId = row.getValue('phoneNumberId');
      const phoneNumber = numbers.value.find(n => n.id === phoneNumberId);
      const phoneNumberLabel = phoneNumber ? `${phoneNumber.number} (${phoneNumber.name})` : 'N/A';

      return phoneNumberLabel;
    }
  },
  {
    accessorKey: 'schedule',
    header: 'Scheduled Date',
    cell: ({ row }: { row:any }) => formatDate(new Date(row.getValue('schedule')))
  },
  { 
    accessorKey: 'phoneNumbers', 
    header: 'Users Count', 
    cell: ({ row }: { row:any }) => {
      try {
        const list = JSON.parse(row.getValue('phoneNumbers'))
        return list.length
      } catch (error) {
        return row.getValue('phoneNumbers').length
      }
    }
  },
  { 
    accessorKey: 'progress', 
    header: 'Progress', 
    cell: ({ row }: { row:any }) => `${row.getValue('progress')}%` 
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row:any }) => {
      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color: getStatusColor(row.getValue('status')) },
        () => row.getValue('status')
      )
    }
  },
  { id: 'actions',  cell: ({ row }: { row:any }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getJobActions(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    } }
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

  if (jobState.value.selectedStatus === 'all') {
    return jobs
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
    case 'pending': return 'info'
    case 'running': return 'success'
    case 'paused': return 'warning'
    case 'completed': return 'success'
    case 'failed': return 'error'
    default: return 'neutral'
  }
}

const getProgressColor = (job: Job) => {
  if (job.status === 'failed') return 'error'
  if (job.status === 'paused') return 'warning'
  return 'success'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
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
      quickViewJob.value = filteredJobs.value[job.id]
      slideover.open(JobDetailsSlideover, {
        jobId: quickViewJob.value.id
      })
      break
    case 'edit':
      const jobDetails = filteredJobs.value[job.id]
      editingJob.value = jobDetails
      jobForm.value = {
        ...jobDetails,
        phoneNumbers: JSON.parse(jobDetails.phoneNumbers)
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
      const targetJob = filteredJobs.value[job.id]
      const confirming = await confirm(`Are you sure you want to delete this job? ${targetJob.name}`)
      if(confirming) {
        const response = await deleteJob(targetJob.id)
        if(response) {
          toast.add({
            title: 'Job deleted',
            description: 'Job deleted successfully',
            color: 'success'
          })
        } else {
          toast.add({
            title: 'Job deletion failed',
            description: 'Job deletion failed',
            color: 'error'
          })
        }
      }
      break
  }
}

const handleJobSubmit = async (jobData: Job) => {
  isSubmitting.value = true
  try {
    if (editingJob.value) {
      console.log(jobData);
      // Implement edit
    } else {
      await createJob(jobData)
    }

    showCreateModal.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleSelectJob = (job : Job) => {
  handleJobAction('view', job)
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


function getJobPhoneNumbers(job: Job) {
  return JSON.parse(job.phoneNumbers)
}

function handleCreateJob() {
  editingJob.value = null
  showCreateModal.value = true
}

onMounted(async () => {
  await getJobs()
  await fetchAssistants()
  await fetchNumbers()
})
</script>
