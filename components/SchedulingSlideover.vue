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
            <UBadge v-if="statusCounts.ended" color="success" variant="solid" class="flex items-center gap-1">
              <UIcon name="i-heroicons-check-circle" />
              {{ statusCounts.ended }} Completed
            </UBadge>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton v-if="scheduledCalls.length" color="red" variant="ghost" icon="i-lucide-trash-2"
            @click="clearCalls" />
          <UButton v-if="!isSimulating" color="primary" label="Generate Mock Data"
            @click="() => generateMockData(numberOfCalls)" />
        </div>
      </div>
      <div class="flex justify-between items-center">

        <p class="text-sm text-gray-500">
          Priority levels: P1 (High) - P3 (Low)
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
          </div>
        </label>

        <div class="flex items-center gap-2">
          <UInput v-model="numberOfCalls" type="number" min="1" max="100" placeholder="Number of calls" class="w-32" />
          <UButton color="primary" label="Generate Mock Data" @click="() => generateMockData(numberOfCalls)" />
        </div>
      </div>

      <template v-else>
        <div class="flex flex-col gap-4 mb-6">
          <div class="flex items-center gap-4">
            <UInput v-model="numberOfCalls" type="number" min="1" max="100" placeholder="Number of calls"
              class="w-32" />
            <USelect v-model="selectedTimeWindow" :items="timeWindowOptions" class="w-48" />
          </div>

          <div class="flex items-center gap-4">
            <USelect v-model="selectedAssistant"
              :items="assistants.map(assistant => ({ value: assistant.id, label: assistant.name }))"
              placeholder="Select Assistant" class="flex-1" option-attribute="name" value-attribute="id" required />
            <USelect v-model="selectedNumber"
              :items="numbers.map(number => ({ value: number.id, label: `${number.name} (${number.number})` }))"
              placeholder="Select Number" class="flex-1" option-attribute="name" value-attribute="id" required />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-2 text-sm text-gray-500">
              <p>{{ scheduledCalls.length }} calls scheduled between {{ formatTime(workingHours.start) }} - {{
                formatTime(workingHours.end) }}</p>
              <template v-if="selectedAssistant && selectedNumber">
                <p>
                  Using assistant <span class="font-medium text-primary-600">{{ getSelectedAssistantName }}</span>
                  with phone number <span class="font-medium text-primary-600">{{ getSelectedNumberName }}</span>
                </p>
              </template>
            </div>

            <div class="flex justify-end space-x-2 mt-4">
              <UButton
                v-if="scheduledCalls.length && !isSimulating"
                color="primary"
                :disabled="!selectedAssistant || !selectedNumber"
                @click="runSimulation"
              >
                {{ !selectedAssistant || !selectedNumber ? 'Select Assistant & Phone Number' : 'Run Job' }}
              </UButton>
              <UButton
                v-if="isSimulating"
                :color="isPaused ? 'primary' : 'yellow'"
                @click="isPaused ? runSimulation() : pauseJob()"
              >
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
                <UButton
                  v-if="call.status === CallStatus.Ended"
                  size="xs"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-document-text"
                  @click="openTranscript(call)"
                >
                  View Transcript
                </UButton>
                <UBadge
                  :color="getStatusColor(call.status)"
                  class="capitalize"
                >
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
        <UButton
          :color="isPaused ? 'primary' : 'yellow'"
          @click="isPaused ? runSimulation() : pauseJob()"
        >
          {{ isPaused ? 'Resume Job' : 'Pause Job' }}
        </UButton>
      </div>
      <UProgress
        :value="completedPercentage"
        :color="isPaused ? 'gray' : 'primary'"
        size="sm"
      />
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useCallScheduler, CallStatus } from '@/composables/useCallScheduler'
import { useAssistants } from '@/composables/useAssistants'
import TranscriptSlideover from '@/components/TranscriptSlideover.vue'
import * as XLSX from 'xlsx'

const isOpen = defineModel('modelValue', { type: Boolean })
const numberOfCalls = ref(10)
const fileInput = ref<HTMLInputElement | null>(null)

const { assistants, fetchAssistants } = useAssistants()
const selectedAssistant = ref('')
const selectedNumber = ref('')
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
      phone: row.phone_number,
      estimatedDuration: Math.floor(Math.random() * (simulationConfig.value.callDurationRange.max - simulationConfig.value.callDurationRange.min + 1)) + simulationConfig.value.callDurationRange.min,
      status: CallStatus.Queued,
      scheduledTime: new Date(),
      priority: row.priority || Math.floor(Math.random() * 3) + 1,
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
  scheduledCalls,
  isSimulating,
  simulationConfig,
  selectedAssistant: schedulerAssistant,
  selectedNumber: schedulerNumber,
  generateMockData,
  clearCalls,
} = useCallScheduler()

const isPaused = ref(false)

// Sync local state with scheduler state
watch(selectedAssistant, (value) => {
  schedulerAssistant.value = value
})

watch(selectedNumber, (value) => {
  schedulerNumber.value = value
})

const slideover = useSlideover();
const openTranscript = (call: any) => {
  const { selectedCall } = useCalls()
  selectedCall.value = call

  slideover.open(TranscriptSlideover)
}

async function processNextCall() {
  if (!isSimulating.value || isPaused.value) return

  const nextCall = scheduledCalls.value.find(call => call.status === CallStatus.Queued)
  if (!nextCall) {
    // No more calls in queue, end simulation
    isSimulating.value = false
    return
  }

  try {
    const result = await $fetch('/api/call', {
      method: 'POST',
      body: {
        phoneNumber: nextCall.phone,
        assistantId: selectedAssistant.value,
        phoneNumberId: selectedNumber.value
      }
    })

    if (result.success) {
      nextCall.callId = result.callId
      pollCallStatus(nextCall)
    } else {
      nextCall.status = CallStatus.Ended
    }
  } catch (error) {
    console.error('Call creation error:', error)
    nextCall.status = CallStatus.Ended
  }
}

// Polling intervals in milliseconds
const POLLING_INITIAL_DELAY = 10000
const POLLING_INTERVAL = 5000
const POLLING_MAX_ATTEMPTS = 60

async function pollCallStatus(call: any) {
  if (!call.callId || call.status === CallStatus.Ended) return

  call.polling = true
  call.pollingAttempts = 0
  call.pollTimer = null

  const clearPolling = () => {
    if (call.pollTimer) {
      clearTimeout(call.pollTimer)
      call.pollTimer = null
    }
    call.polling = false
  }

  const pollCall = async () => {
    try {
      const data = await $fetch(`/api/call/${call.callId}`)    
      
      // Update call object with API response data
      call.status = data.status
      call.transcript = data.transcript
      call.recordingUrl = data.recordingUrl
      call.duration = data.duration
      
      if (data.status === CallStatus.Ended) {
        call.summary = data.summary
        clearPolling()
        // Process next call in queue
        processNextCall()
      } else if (data.status === 'failed') {
        call.status = CallStatus.Ended
        clearPolling()
        // Process next call even if current call failed
        processNextCall()
      } else {
        // Continue polling if not ended and within max attempts
        call.pollingAttempts++
        if (call.pollingAttempts < POLLING_MAX_ATTEMPTS) {
          call.pollTimer = setTimeout(pollCall, POLLING_INTERVAL)
        } else {
          console.warn('Max polling attempts reached for call:', call.callId)
          call.status = CallStatus.Ended
          clearPolling()
          processNextCall()
        }
      }
    } catch (error) {
      console.error('Error polling call status:', error)
      call.status = CallStatus.Ended
      clearPolling()
      // Process next call even if there was an error
      processNextCall()
    }
  }

  // Start initial poll after a short delay
  call.pollTimer = setTimeout(pollCall, POLLING_INITIAL_DELAY)
}

// Clean up any active polling timers when component is unmounted
onBeforeUnmount(() => {
  scheduledCalls.value.forEach(call => {
    if (call.pollTimer) {
      clearTimeout(call.pollTimer)
    }
  })
})

async function runSimulation() {
  if (!selectedAssistant.value || !selectedNumber.value) {
    return
  }

  if (isSimulating.value && !isPaused.value) return
  
  if (isPaused.value) {
    isPaused.value = false
    return
  }

  isSimulating.value = true
  isPaused.value = false

  // Start with the first call in queue
  processNextCall()
}

function pauseJob() {
  if (!isSimulating.value) return
  isPaused.value = true
}

// Initialize the scheduler with default time window
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

    // Then by priority
    if (a.priority !== b.priority) return (a.priority || 0) - (b.priority || 0)

    // Finally by scheduled time
    return a.scheduledTime.getTime() - b.scheduledTime.getTime()
  })
})

const callCounts = computed(() => {
  const counts = {
    PENDING: 0,
    CONNECTED: 0,
    REJECTED: 0
  }

  scheduledCalls.value.forEach(call => {
    counts[call.status]++
  })

  return counts
})

function getStatusColor(status: string) {
  switch (status) {
    case CallStatus.Queued:
      return 'neutral'
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
  const assistant = assistants.value.find(a => a.id === selectedAssistant.value)
  return assistant?.name || 'Unknown'
})

const getSelectedNumberName = computed(() => {
  const number = numbers.value.find(n => n.id === selectedNumber.value)
  if (!number) return 'Unknown'
  return `${number?.name} (${number?.number})`
})

// Progress tracking
const totalCalls = computed(() => scheduledCalls.value.length)
const completedCalls = computed(() => scheduledCalls.value.filter(call => call.status === CallStatus.Ended).length)
const completedPercentage = computed(() => (completedCalls.value / totalCalls.value) * 100)

// Status counts
const statusCounts = computed(() => {
  const counts = {
    queued: 0,
    ringing: 0,
    inProgress: 0,
    forwarding: 0,
    ended: 0
  }
  
  scheduledCalls.value.forEach(call => {
    switch (call.status) {
      case CallStatus.Queued:
        counts.queued++
        break
      case CallStatus.Ringing:
        counts.ringing++
        break
      case CallStatus.InProgress:
        counts.inProgress++
        break
      case CallStatus.Forwarding:
        counts.forwarding++
        break
      case CallStatus.Ended:
        counts.ended++
        break
    }
  })
  
  return counts
})

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
      return 'text-yellow-500'
    case CallStatus.InProgress:
      return 'text-blue-500'
    case CallStatus.Forwarding:
      return 'text-yellow-500'
    case CallStatus.Ended:
      return 'text-green-500'
    default:
      return 'text-red-500'
  }
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
