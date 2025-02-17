<template>
  <USlideover title="Schedule Calls">
    <template #header> 
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold">Call Schedule Plan</h3>
          <div v-if="scheduledCalls.length" class="flex gap-3 mt-2 text-sm">
            <UBadge v-if="statusCounts.queued" color="neutral" variant="solid" class="flex items-center gap-1">
              <UIcon name="i-heroicons-clock" />
              {{ statusCounts.queued }} Queued
            </UBadge>
            <UBadge v-if="statusCounts.ringing" color="warning" variant="solid" class="flex items-center gap-1">
              <UIcon name="i-heroicons-phone" />
              {{ statusCounts.ringing }} Ringing
            </UBadge>
            <UBadge v-if="statusCounts.inProgress" color="info" variant="solid" class="flex items-center gap-1">
              <UIcon name="i-heroicons-play" />
              {{ statusCounts.inProgress }} In Progress
            </UBadge>
            <UBadge v-if="statusCounts.forwarding" color="warning" variant="solid" class="flex items-center gap-1">
              <UIcon name="i-heroicons-arrow-path" />
              {{ statusCounts.forwarding }} Forwarding
            </UBadge>
            <UBadge v-if="statusCounts.ended" color="success" variant="solid" class="flex items-center gap-1">
              <UIcon name="i-heroicons-check-circle" />
              {{ statusCounts.ended }} Completed
            </UBadge>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton v-if="scheduledCalls.length" color="error" variant="ghost" icon="i-lucide-trash-2"
            @click="clearCalls" />
          <UButton v-if="scheduledCalls.length" color="primary" variant="ghost" icon="i-lucide-download"
            label="Export Results" @click="downloadResults" />
        </div>
      </div>
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-500">
          Upload your call schedule list
        </p>
      </div>
    </template>

    <template #body>
      <div v-if="!scheduledCalls.length && !isSimulating" class="space-y-4">
        <label id="dropcontainer" for="file-input" class="drop-container" @dragover.prevent
          @dragenter.prevent="(e: any) => { e.target.classList.add('drag-active') }"
          @dragleave.prevent="(e: any) => { e.target.classList.remove('drag-active') }" @drop.prevent="handleDrop">
          <span class="drop-title">Drop CSV/Excel file here</span>
          <span class="text-sm text-gray-500">or</span>
          <input id="file-input" ref="fileInput" type="file" accept=".csv,.xlsx,.xls" @input="handleFileInput" />
          <div class="text-xs text-gray-400 mt-2">
            <div>Supported formats: CSV, Excel (XLSX, XLS)</div>
            <div>Required columns: phone_number</div>
            <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-document-arrow-down"
              label="Download Template" class="mt-2" @click="downloadTemplate" />
          </div>
        </label>

        <div class="flex items-center gap-2 float-right">
          <UInput v-model.number="numberOfCalls" type="number" min="1" max="100" placeholder="Number of calls" class="w-32" />
          <UButton color="neutral" variant="ghost" label="Generate Mock Data"
            @click="generateMockData(Number(numberOfCalls))" />
        </div>
      </div>

      <template v-else>
        <div class="flex flex-col gap-4 mb-6">

          <div class="flex items-center gap-4">
            <UFormField label="Job Name" required>
              <UInput v-model="state.jobName" placeholder="Enter job name" />
            </UFormField>
            
            <UFormField label="Working Hours">
              <USelect v-model="selectedTimeWindow" :items="timeWindowOptions" class="w-48" />
            </UFormField>

            <UFormField label="Choose Assistant">
              <USelect v-model="state.selectedAssistant"
                :items="assistants.map(assistant => ({ value: assistant.id, label: assistant.name }))"
                placeholder="Select Assistant" class="w-48" option-attribute="name" value-attribute="id" required />
            </UFormField>
            <UFormField label="Select Outbound Phone Number">
              <PhoneNumberSelect v-model="state.selectedNumber" class="w-full" />
            </UFormField>
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-2 text-sm text-gray-500">
              <p><span class="font-medium text-primary">{{ scheduledCalls.length }}</span> calls scheduled between <span
                  class="font-medium text-primary">{{ formatTime(workingHours.start) }} - {{
                    formatTime(workingHours.end) }}</span></p>
              <template v-if="selectedAssistant && selectedNumber">
                <p>
                  Using assistant <span class="font-medium text-primary">{{ getSelectedAssistantName }}</span>
                  with phone number <span class="font-medium text-primary">{{ getSelectedNumberName }}</span>
                </p>
              </template>
            </div>

            <div class="flex justify-end space-x-2 mt-4">
              <!-- handleCreateJob -->
              <UButton v-if="scheduledCalls.length && !isSimulating" color="primary"
                :disabled="!selectedAssistant || !selectedNumber" @click="handleCreateJob">
                {{ !selectedAssistant || !selectedNumber ? 'Select Assistant & Phone Number' : 'Run Job' }}
              </UButton>
              <!-- <UButton v-if="scheduledCalls.length && !isSimulating" color="primary"
                :disabled="!state.selectedAssistant || !state.selectedNumber" @click="runSimulation">
                {{ !state.selectedAssistant || !state.selectedNumber ? 'Select Assistant & Phone Number' : 'Run Job' }}
              </UButton> -->
              <UButton v-if="isSimulating" :color="isPaused ? 'primary' : 'warning'"
                @click="isPaused ? runSimulation() : pauseJob()">
                {{ isPaused ? 'Resume Job' : 'Pause Job' }}
              </UButton>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="call in sortedCalls" :key="call.id" class="shadow rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon :name="getStatusIcon(call.status)" :class="getStatusIconColor(call.status)" />
                <div>
                  <div class="text-sm">{{ call.phone }}</div>
                  <div class="text-sm text-gray-500">{{ call.status }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UButton v-if="call.status === CallStatus.Ended" size="xs" color="gray" variant="ghost"
                  icon="i-heroicons-document-text" @click="openTranscript(call)">
                  View Transcript
                </UButton>
                <UBadge :color="getStatusColor(call.status)" class="capitalize">
                  {{ call.status }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <div v-if="isSimulating" class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon v-if="!isPaused" name="i-heroicons-arrow-path" class="animate-spin" />
          <span>{{ completedCalls }} of {{ totalCalls }} calls completed</span>
        </div>
        <UButton :color="isPaused ? 'primary' : 'warning'" @click="isPaused ? runSimulation() : pauseJob()">
          {{ isPaused ? 'Resume Job' : 'Pause Job' }}
        </UButton>
      </div>
      <UProgress :value="completedPercentage" :color="isPaused ? 'neutral' : 'primary'" size="sm" />
    </div>
  </USlideover>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useCallScheduler, CallStatus } from '@/composables/useCallScheduler'
import { useAssistants } from '@/composables/useAssistants'
import { useJobState } from '@/composables/useJobState'
import TranscriptSlideover from '@/components/TranscriptSlideover.vue'
import PhoneNumberSelect from '@/components/PhoneNumberSelect.vue'
import * as XLSX from 'xlsx'

const toast = useToast()
const isOpen = defineModel('modelValue', { type: Boolean })
const slideover = useSlideover()
const fileInput = ref<HTMLInputElement | null>(null)

const { createJob, pauseJob } = useJobState()
const { assistants, fetchAssistants } = useAssistants()

const { 
  scheduledCalls,
  isSimulating,
  generateMockData,
  selectedAssistant,
  selectedNumber,
  runSimulation,
  clearCalls
} = useCallScheduler()

const state = reactive({
  jobName: '',
  selectedAssistant: selectedAssistant,
  selectedNumber: selectedNumber,
  contacts: null,
  isSubmitting: false
})

const selectedDate = defineModel('selectedDate', { type: Object })

// Fetch assistants on mount
onMounted(async () => {
  await fetchAssistants()
})

async function handleCreateJob() {
  if (state.isSubmitting) return
  
  state.isSubmitting = true
  try {
    let currentHour = new Date().getHours()
    let currentMinute = new Date().getMinutes()

    if(currentHour < selectedTimeWindow.value.start || currentHour > selectedTimeWindow.value.end) {
      currentHour = selectedTimeWindow.value.start;
    }
    await createJob({
      name: state.jobName,
      assistantId: state.selectedAssistant,
      phoneNumbers: scheduledCalls.value.map((call: any) => call.phone),
      names: scheduledCalls.value.map((call: any) => call.name),
      schedule: new Date(selectedDate.value.year, selectedDate.value.month - 1, selectedDate.value.day, currentHour, currentMinute, 0, 0),
      totalCalls: scheduledCalls.value.length,
      phoneNumberId: state.selectedNumber
    })
    slideover.close()
    toast.add({
      title: 'Success',
      description: 'Job created successfully',
      color: 'success'
    })
  } catch (error) {
    console.error('Failed to create job:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to create job',
      color: 'error'
    })
  } finally {
    state.isSubmitting = false
  }
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    state.contacts = file
  }
}



const isPaused = ref(false)
const numberOfCalls = ref<number>(10)
const completedCalls = ref(0)
const totalCalls = ref(0)

const statusCounts = computed(() => ({
  queued: scheduledCalls.value.filter(call => call.status === CallStatus.Queued).length,
  ringing: scheduledCalls.value.filter(call => call.status === CallStatus.Ringing).length,
  inProgress: scheduledCalls.value.filter(call => call.status === CallStatus.InProgress).length,
  forwarding: scheduledCalls.value.filter(call => call.status === CallStatus.Forwarding).length,
  ended: scheduledCalls.value.filter(call => call.status === CallStatus.Ended).length
}))

// Polling interval for status updates (in milliseconds)
const POLLING_INTERVAL = 5000
let statusPollingTimer: NodeJS.Timer | null = null

const startStatusPolling = () => {
  if (statusPollingTimer) return

  // Initial fetch
  fetchScheduleStatus()

  // Start polling
  statusPollingTimer = setInterval(fetchScheduleStatus, POLLING_INTERVAL)
}

const stopStatusPolling = () => {
  if (statusPollingTimer) {
    clearInterval(statusPollingTimer)
    statusPollingTimer = null
  }
}

const fetchScheduleStatus = async () => {
  try {
    const { data: response } = await useFetch('/api/schedule/status')
    if (response.value?.success) {
      scheduledCalls.value = response.value.jobs

      // Update counts
      completedCalls.value = scheduledCalls.value.filter(call => call.status === CallStatus.Ended).length
      totalCalls.value = scheduledCalls.value.length

      // Stop polling if all calls are completed
      if (completedCalls.value === totalCalls.value && totalCalls.value > 0) {
        stopStatusPolling()
      }
    }
  } catch (error) {
    console.error('Error fetching schedule status:', error)
  }
}

// Clean up polling on component unmount
onBeforeUnmount(() => {
  stopStatusPolling()
})

const numbers = ref([])

// Fetch phone numbers
onMounted(async () => {
  try {
    if (assistants.value.length === 0) {
      await fetchAssistants()
    }

    const response = await fetch('/api/numbers')
    const data = await response.json()
    if (data.success) {
      numbers.value = data.numbers
    }
  } catch (error) {
    console.error('Failed to fetch phone numbers:', error)
  }
})

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  try {
    const data = await readFileAsArrayBuffer(file)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const rows = XLSX.utils.sheet_to_json(worksheet)

    if (rows.length === 0) {
      throw new Error('File is empty')
    }

    // Check if phone_number column exists
    const firstRow = rows[0] as any
    if (!('phone_number' in firstRow)) {
      throw new Error('File must contain a phone_number column')
    }

    // Process the rows
    scheduledCalls.value = rows.map((row: any) => ({
      id: crypto.randomUUID(),
      phone: `+${row.phone_number}`,
      name: row.name || `Contact ${scheduledCalls.value.length + 1}`,
      estimatedDuration: Math.floor(Math.random() * (simulationConfig.value.callDurationRange.max - simulationConfig.value.callDurationRange.min + 1)) + simulationConfig.value.callDurationRange.min,
      status: CallStatus.Queued,
      scheduledTime: new Date(),
      notes: row.notes || `Call ID ${scheduledCalls.value.length + 1}`
    }))
  } catch (error: any) {
    console.error('Error processing file:', error)
    // You might want to show an error message to the user here
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
    reader.onerror = (e) => reject(e)
    reader.readAsArrayBuffer(file)
  })
}

const {
  simulationConfig,
} = useCallScheduler()

const openTranscript = (call: any) => {
  const { selectedCall } = useCalls()
  selectedCall.value = call

  slideover.open(TranscriptSlideover)
}

const workingHours = computed(() => ({
  start: new Date().setHours(simulationConfig.value.timeWindowHours.start, 0, 0, 0),
  end: new Date().setHours(simulationConfig.value.timeWindowHours.end, 0, 0, 0)
}))

const timeWindowOptions = [
  { label: '9 AM - 5 PM', value: { start: 9, end: 17 } },
  { label: '8 AM - 4 PM', value: { start: 8, end: 16 } },
  { label: '10 AM - 6 PM', value: { start: 10, end: 18 } }
]

const selectedTimeWindow = ref(timeWindowOptions[0].value)

// Sync time window changes
watch(selectedTimeWindow, (newWindow) => {
  simulationConfig.value.timeWindowHours = newWindow
}, { immediate: true })

// Generate initial mock data
watch(isOpen, (newValue) => {
  if (newValue && scheduledCalls.value.length === 0) {
    generateMockData(numberOfCalls.value)
  }
})

const sortedCalls = computed(() => {
  return [...scheduledCalls.value].sort((a, b) => {
    // Sort by status (PENDING first)
    if (a.status === CallStatus.Queued && b.status !== CallStatus.Queued) return -1
    if (a.status !== CallStatus.Queued && b.status === CallStatus.Queued) return 1

    // Then by scheduled time
    return a.scheduledTime.getTime() - b.scheduledTime.getTime()
  })
})

function getStatusColor(status: string) {
  switch (status) {
    case CallStatus.Queued:
      return 'error'
    case CallStatus.Ringing:
      return 'warning'
    case CallStatus.InProgress:
      return 'info'
    case CallStatus.Forwarding:
      return 'warning'
    case CallStatus.Ended:
      return 'success'
    default:
      return 'error'
  }
}

function formatTime(date: Date | number) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(new Date(date))
}



const getSelectedAssistantName = computed(() => {
  const assistant = assistants.value.find(a => a.id === state.selectedAssistant)
  return assistant?.name || 'Unknown'
})

const getSelectedNumberName = computed(() => {
  const number = numbers.value.find(n => n.id === selectedNumber.value)
  if (!number) return 'Unknown'
  return `${number?.name} (${number?.number})`
})

// Progress tracking
const completedPercentage = computed(() => (completedCalls.value / totalCalls.value) * 100)

function getStatusIcon(status: string) {
  switch (status) {
    case CallStatus.Queued:
      return 'i-heroicons-clock'
    case CallStatus.Ringing:
      return 'i-heroicons-phone'
    case CallStatus.InProgress:
      return 'i-heroicons-play'
    case CallStatus.Forwarding:
      return 'i-heroicons-arrow-path'
    case CallStatus.Ended:
      return 'i-heroicons-check-circle'
    default:
      return 'i-heroicons-x-circle'
  }
}

function getStatusIconColor(status: string) {
  switch (status) {
    case CallStatus.Queued:
      return 'text-gray-500'
    case CallStatus.Ringing:
      return 'text-warning'
    case CallStatus.InProgress:
      return 'text-info'
    case CallStatus.Forwarding:
      return 'text-warning'
    case CallStatus.Ended:
      return 'text-success'
    default:
      return 'text-error'
  }
}

function downloadTemplate() {
  const headers = ['phone_number', 'name', 'notes']
  const sampleData = [
    ['6582888399', 'Max', 'Follow up on previous conversation'],
    ['6583508503', 'John', 'Discuss new requirements'],
    ['6597599995', 'Jacky', 'Regular check-in call']
  ]

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'call_schedule_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Function to download call results as CSV
function downloadResults() {
  const headers = ['phone_number', 'name', 'notes', 'status', 'scheduled_time', 'duration', 'transcript']

  const resultData = scheduledCalls.value.map(call => [
    call.phone,
    call.name || '',
    call.notes || '',
    call.status,
    new Date(call.scheduledTime).toISOString(),
    call.duration || '',
    call.transcript || ''
  ])

  const csvContent = [
    headers.join(','),
    ...resultData.map(row => row.map(cell => {
      // Handle cells that might contain commas by wrapping in quotes
      if (cell && cell.toString().includes(',')) {
        return `"${cell.toString().replace(/"/g, '""')}"` // Fix: escape double quotes
      }
      return cell
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  link.setAttribute('download', `call_results_${timestamp}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.drop-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  max-width: 100%;
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed var(--color-gray-200);
  background-color: var(--color-gray-50);
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.drop-container:hover,
.drop-container.drag-active {
  background-color: var(--color-gray-100);
  border-color: var(--color-primary-500);
}

.drop-title {
  color: var(--color-gray-600);
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.drop-container input[type=file] {
  width: 350px;
  max-width: 100%;
  color: var(--color-gray-700);
  padding: 5px;
  background: var(--color-white);
  border-radius: 5px;
  border: 1px solid var(--color-gray-300);
}

.drop-container input[type=file]::file-selector-button {
  margin-right: 20px;
  border: none;
  background: var(--color-primary-500);
  padding: 8px 16px;
  border-radius: 5px;
  color: var(--color-white);
  cursor: pointer;
  transition: 'background' .2s ease-in-out;
}

.drop-container input[type=file]::file-selector-button:hover {
  background: var(--color-primary-600);
}
</style>
