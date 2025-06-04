<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-phone" class="text-primary" />
            <h1 class="text-xl font-semibold">RingCentral Integration Demo</h1>
          </div>
        </div>
      </template>

      <div class="p-4">
        <div class="mb-6">
          <UAlert v-if="error" color="red" variant="soft" icon="i-lucide-alert-circle" class="mb-4">
            {{ error }}
          </UAlert>

          <div class="flex items-center gap-4 mb-6">
            <UButton 
              @click="fetchRecentCalls" 
              color="primary" 
              :loading="loading"
              :disabled="loading"
            >
              <template #leading>
                <UIcon name="i-lucide-refresh-cw" />
              </template>
              Fetch Recent Calls
            </UButton>
            
            <div v-if="lastUpdated" class="text-sm text-gray-500">
              Last updated: {{ lastUpdated }}
            </div>
          </div>

          <div v-if="loading" class="flex justify-center py-8">
            <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-gray-400" />
          </div>

          <div v-else-if="recentCalls.length === 0 && !error" class="text-center py-8 text-gray-500">
            <UIcon name="i-lucide-phone-off" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No recent calls found</p>
          </div>

          <div v-else>
            <UTable :columns="columns" :rows="recentCalls" :sort="{ column: 'startTime', direction: 'desc' }">
              <template #direction-data="{ row }">
                <UBadge :color="row.direction === 'Inbound' ? 'green' : 'blue'" variant="soft">
                  <template #leading>
                    <UIcon :name="row.direction === 'Inbound' ? 'i-lucide-phone-incoming' : 'i-lucide-phone-outgoing'" />
                  </template>
                  {{ row.direction }}
                </UBadge>
              </template>

              <template #status-data="{ row }">
                <UBadge 
                  :color="getStatusColor(row.status)" 
                  variant="soft"
                >
                  {{ row.status }}
                </UBadge>
              </template>

              <template #startTime-data="{ row }">
                {{ formatDate(row.startTime) }}
              </template>

              <template #duration-data="{ row }">
                {{ formatDuration(row.duration) }}
              </template>

              <template #recording-data="{ row }">
                <UButton 
                  v-if="row.hasRecording" 
                  color="gray" 
                  variant="ghost" 
                  icon="i-lucide-play" 
                  size="xs"
                  @click="playRecording(row.id)"
                >
                  Play
                </UButton>
                <span v-else class="text-gray-400">No recording</span>
              </template>
            </UTable>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Recording Modal -->
    <UModal v-model="showRecordingModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Call Recording</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="showRecordingModal = false" />
          </div>
        </template>
        <div class="p-4">
          <div v-if="loadingRecording" class="flex justify-center py-4">
            <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-gray-400" />
          </div>
          <div v-else-if="recordingError" class="text-center text-red-500">
            {{ recordingError }}
          </div>
          <div v-else-if="recordingUrl" class="flex flex-col items-center">
            <audio controls :src="recordingUrl" class="w-full mb-4"></audio>
            <UButton 
              color="primary" 
              variant="soft" 
              icon="i-lucide-download" 
              @click="downloadRecording"
            >
              Download Recording
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Define table columns
const columns = [
  {
    key: 'direction',
    label: 'Direction',
    sortable: true
  },
  {
    key: 'from',
    label: 'From',
    sortable: true
  },
  {
    key: 'to',
    label: 'To',
    sortable: true
  },
  {
    key: 'startTime',
    label: 'Time',
    sortable: true
  },
  {
    key: 'duration',
    label: 'Duration',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  },
  {
    key: 'recording',
    label: 'Recording',
    sortable: false
  }
]

// State
const recentCalls = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref('')

// Recording modal state
const showRecordingModal = ref(false)
const recordingUrl = ref('')
const loadingRecording = ref(false)
const recordingError = ref('')
const selectedCallId = ref('')

// Get status color based on call status
function getStatusColor(status) {
  const statusMap = {
    'Completed': 'green',
    'Missed': 'red',
    'Voicemail': 'yellow',
    'Rejected': 'orange',
    'Failed': 'red',
    'Busy': 'orange',
    'NoAnswer': 'yellow'
  }
  
  return statusMap[status] || 'gray'
}

// Format date
function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

// Format duration in seconds to mm:ss
function formatDuration(seconds) {
  if (!seconds) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Fetch recent calls
async function fetchRecentCalls() {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await useFetch('/api/ringcentral/calls')
    
    if (data.value?.success) {
      recentCalls.value = data.value.calls.map(call => ({
        id: call.id,
        direction: call.direction,
        from: call.from?.phoneNumber || 'Unknown',
        to: call.to?.phoneNumber || 'Unknown',
        startTime: call.startTime,
        duration: call.duration,
        status: call.result,
        hasRecording: call.recording?.id ? true : false
      }))
      
      lastUpdated.value = new Date().toLocaleTimeString()
    } else {
      error.value = data.value?.error || 'Failed to fetch recent calls'
    }
  } catch (err) {
    console.error('Error fetching calls:', err)
    error.value = err.message || 'An error occurred while fetching calls'
  } finally {
    loading.value = false
  }
}

// Play recording
async function playRecording(callId) {
  showRecordingModal.value = true
  loadingRecording.value = true
  recordingError.value = ''
  recordingUrl.value = ''
  selectedCallId.value = callId
  
  try {
    const { data } = await useFetch(`/api/ringcentral/recordings/${callId}`)
    
    if (data.value?.success) {
      recordingUrl.value = data.value.url
    } else {
      recordingError.value = data.value?.error || 'Failed to fetch recording'
    }
  } catch (err) {
    console.error('Error fetching recording:', err)
    recordingError.value = err.message || 'An error occurred while fetching recording'
  } finally {
    loadingRecording.value = false
  }
}

// Download recording
function downloadRecording() {
  if (!recordingUrl.value) return
  
  const a = document.createElement('a')
  a.href = recordingUrl.value
  a.download = `recording-${selectedCallId.value}.mp3`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// Fetch calls on page load
onMounted(() => {
  fetchRecentCalls()
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
