<template>
  <div class="scheduling-overview p-6">
    <UContainer>
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Call Scheduling</h1>
        <p class="text-gray-500">Manage and schedule your outbound calls</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar Section -->
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Calendar View</h2>
              <UButton 
                icon="i-lucide-plus" 
                label="Create New Job"
                @click="state.openScheduleModal = true"
              />
            </div>
          </template>
          <UCalendar 
            class="w-full"
          />
        </UCard>

        <!-- Upcoming Calls Section -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Upcoming Calls</h2>
              <UButton 
                icon="i-lucide-calendar" 
                label="Schedule Calls"
                @click="openSlideover"
              />
            </div>
          </template>
          <UTable 
            :rows="state.jobs" 
            :columns="jobColumns"
            class="w-full"
          >
            <template #status-data="{ row }">
              <UBadge
                :color="getStatusColor(row.status)"
                size="sm"
                variant="subtle"
              >
                {{ row.status }}
              </UBadge>
            </template>
            <template #progress-data="{ row }">
              <div class="w-full flex items-center gap-2">
                <UProgress
                  :value="row.progress"
                  :color="getStatusColor(row.status)"
                  size="xs"
                  class="flex-1"
                />
                <span class="text-sm text-gray-600">{{ row.progress }}%</span>
              </div>
            </template>
            <template #completedCalls-data="{ row }">
              <span class="text-sm">{{ row.completedCalls }}/{{ row.totalCalls }} calls</span>
            </template>
            <template #actions-data="{ row }">
              <div class="flex gap-2">
                <UButton
                  v-if="row.status === 'running'"
                  color="warning"
                  variant="soft"
                  icon="i-lucide-pause"
                  size="sm"
                  @click="pauseJob(row.id)"
                  :loading="row.id === state.loadingJobId"
                />
                <UButton
                  v-if="row.status === 'paused'"
                  color="success"
                  variant="soft"
                  icon="i-lucide-play"
                  size="sm"
                  @click="resumeJob(row.id)"
                  :loading="row.id === state.loadingJobId"
                />
                <UButton
                  v-if="['running', 'paused'].includes(row.status)"
                  color="error"
                  variant="soft"
                  icon="i-lucide-stop"
                  size="sm"
                  @click="stopJob(row.id)"
                  :loading="row.id === state.loadingJobId"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-more-vertical"
                  size="sm"
                  @click="showJobDetails(row)"
                />
              </div>
            </template>
          </UTable>
        </UCard>
      </div>

      <!-- Create New Job Modal -->
      <UModal 
        :open="state.openScheduleModal" 
        title="Create New Job"
        description="Create a new calling job by uploading a list of phone numbers."
        :close="false"
      >
        <template #body>
          <UForm 
            :schema="scheduleFormSchema" 
            :state="newJob" 
            class="space-y-4" 
            @submit="handleCreateJob"
          >
            <UFormField 
              label="Job Name" 
              name="name"
              description="Name of your calling campaign"
              size="xl"
              required
            >
              <UInput 
                v-model="newJob.name" 
                class="w-full" 
                placeholder="e.g., Customer Survey Dec 2024" 
              />
            </UFormField>

            <UFormField 
              label="Schedule" 
              name="schedule"
              description="Campaign start date and time"
              size="xl"
              required
            >
            </UFormField>

            <UFormField 
              label="Outbound Number" 
              name="outboundNumber"
              description="Caller ID for recipients"
              size="xl"
              required
            >
              <USelect
                v-model="newJob.outboundNumber"
                :items="outboundNumbers"
                class="w-full"
                placeholder="Select outbound number"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField 
                label="Start Time" 
                name="callingHours.start"
                description="Daily start time"
                size="xl"
                required
              >
                <UInput
                  v-model="newJob.callingHours.start"
                  type="time"
                  class="w-full"
                  placeholder="09:00"
                />
              </UFormField>
              
              <UFormField 
                label="End Time" 
                name="callingHours.end"
                description="Daily end time"
                size="xl"
                required
              >
                <UInput
                  v-model="newJob.callingHours.end"
                  type="time"
                  class="w-full"
                  placeholder="17:00"
                />
              </UFormField>
            </div>

            <UFormField 
              label="Phone Numbers" 
              name="phoneNumbers"
              description="Upload Excel/CSV with phone numbers"
              size="xl"
              required
            >
              <div class="space-y-2">
                <UInput
                  type="file"
                  accept=".xlsx,.csv"
                  @change="handleFileUpload"
                  class="w-full"
                  label="Upload Excel/CSV"
                />
                <p class="mt-2 text-sm text-gray-500">
                  {{ state.uploadStatus }}
                </p>
              </div>
            </UFormField>

            <UFormField 
              label="Notes" 
              name="notes"
              description="Additional information about this campaign"
              hint="Optional"
              help="Add any relevant details that might be helpful for tracking or reference"
              size="xl"
            >
              <UTextarea 
                v-model="newJob.notes" 
                class="w-full" 
                placeholder="e.g., Follow-up campaign for customer satisfaction survey" 
              />
            </UFormField>

            <div class="flex justify-end gap-2 mt-4">
              <UButton label="Cancel" color="neutral" variant="outline" @click="state.openScheduleModal = false" />
              <UButton 
                type="submit" 
                label="Create Job" 
                color="primary" 
                :disabled="!state.isFileUploaded"
              />
            </div>
          </UForm>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import SchedulingSlideover from '@/components/SchedulingSlideover.vue'
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useJobState, type Job } from '~/composables/useJobState'

const toast = useToast()
const { state: jobState, pauseJob, resumeJob, stopJob, createJob } = useJobState()

const state = useState('scheduling', () => ({
  openScheduleModal: false,
  jobs: [] as Job[],
  loadingJobId: null as string | null,
  uploadStatus: '',
  isFileUploaded: false,
  phoneNumbers: [] as string[]
}))

const isSchedulingOpen = ref(false)

const outboundNumbers = [
  { label: '+1 732-585-1638', value: '+17325851638' },
  { label: '+44 7700 177778', value: '+447700177778' }
]

const newJob = ref({
  name: '',
  schedule: new Date(),
  notes: '',
  outboundNumber: outboundNumbers[0].value,
  callingHours: {
    start: '09:00',
    end: '17:00'
  }
})

const scheduleFormSchema = {
  name: 'string',
  schedule: 'date',
  notes: 'string?',
  outboundNumber: 'string',
  callingHours: {
    start: 'string',
    end: 'string'
  }
}

const jobColumns = [
  {
    accessorKey: 'name',
    header: 'Job Name',
    sortable: true
  },
  {
    accessorKey: 'schedule',
    header: 'Schedule',
    sortable: true,
    transform: (value: Date) => new Date(value).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  },
  {
    accessorKey: 'outboundNumber',
    header: 'Outbound Number',
    sortable: true,
    transform: (value: string) => outboundNumbers.find(n => n.value === value)?.label || value
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortable: true,
    filterValue: computed(() => jobState.value.selectedStatus)
  },
  {
    accessorKey: 'progress',
    header: 'Progress'
  },
  {
    accessorKey: 'completedCalls',
    header: 'Completed',
    transform: (value: number, row: Job) => `${value}/${row.totalCalls} calls`
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    sortable: false
  }
]

const getStatusColor = (status: Job['status']) => {
  const colors = {
    pending: 'neutral',
    running: 'success',
    paused: 'info',
    completed: 'success',
    failed: 'error'
  }

  return colors[status] as "neutral" | "success" | "info" | "error" | "primary" | "secondary" | "warning" 
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  state.value.uploadStatus = 'Processing file...'
  
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // Extract phone numbers from the first column
    state.value.phoneNumbers = jsonData
      .slice(1) // Skip header row
      .map(row => (row as any[])[0]?.toString())
      .filter(phone => phone && /^\+?\d+$/.test(phone))
    
    state.value.uploadStatus = `${state.value.phoneNumbers.length} phone numbers loaded`
    state.value.isFileUploaded = state.value.phoneNumbers.length > 0
  } catch (error) {
    console.error('Error processing file:', error)
    state.value.uploadStatus = 'Error processing file'
    state.value.isFileUploaded = false
  }
}

const slideover = useSlideover()
const openSlideover = () => {
  slideover.open(SchedulingSlideover, {})
}

const showJobDetails = (job: Job) => {
  // Implementation for showing job details modal would go here
  console.log('Show details for job:', job)
}

const handleCreateJob = async (event: any) => {
  const success = await createJob({
    ...newJob.value,
    phoneNumbers: state.value.phoneNumbers,
    totalCalls: state.value.phoneNumbers.length
  })

  if (success) {
    toast.add({
      title: 'Success',
      description: 'Job created successfully'
    })
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to create job',
      color: 'red'
    })
  }
}
</script>

<style scoped>
/* Add styles for the scheduling overview page */
</style>
