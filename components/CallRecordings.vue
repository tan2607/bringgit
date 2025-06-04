<template>
  <div class="call-recordings-container">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Recent Call Recordings</h2>
          <div class="flex space-x-2">
            <UButton
              icon="i-heroicons-arrow-path"
              color="gray"
              variant="ghost"
              :loading="isLoading"
              @click="fetchRecordings"
              :disabled="isLoading"
            >
              Refresh
            </UButton>
            <UButton
              v-if="!useMockData"
              icon="i-heroicons-beaker"
              color="gray"
              variant="ghost"
              @click="toggleMockData"
            >
              Use Mock Data
            </UButton>
            <UButton
              v-else
              icon="i-heroicons-cloud"
              color="gray"
              variant="ghost"
              @click="toggleMockData"
            >
              Use Real Data
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="isLoading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
      </div>

      <div v-else-if="error" class="py-4 text-center">
        <p class="text-red-500">{{ error }}</p>
        <UButton
          class="mt-4"
          color="gray"
          variant="soft"
          @click="fetchRecordings"
        >
          Try Again
        </UButton>
      </div>

      <div v-else-if="recordings.length === 0" class="py-8 text-center">
        <UIcon name="i-heroicons-phone-x-mark" class="h-12 w-12 mx-auto text-gray-400" />
        <p class="mt-4 text-gray-500">No call recordings found</p>
      </div>

      <div v-else>
        <UTable :columns="columns" :rows="recordings" :loading="isLoading">
          <template #direction-data="{ row }">
            <UBadge
              :color="row.direction === 'Inbound' ? 'green' : 'blue'"
              variant="subtle"
              size="sm"
            >
              {{ row.direction || 'Unknown' }}
            </UBadge>
          </template>

          <template #duration-data="{ row }">
            {{ formatDuration(row.duration) }}
          </template>

          <template #startTime-data="{ row }">
            {{ formatDate(row.startTime) }}
          </template>

          <template #actions-data="{ row }">
            <div class="flex space-x-2">
              <UButton
                icon="i-heroicons-play"
                color="primary"
                variant="ghost"
                size="xs"
                @click="playRecording(row)"
                :disabled="isPlayingId === row.id"
              >
                {{ isPlayingId === row.id ? 'Playing...' : 'Play' }}
              </UButton>
              <UButton
                icon="i-heroicons-arrow-down-tray"
                color="gray"
                variant="ghost"
                size="xs"
                @click="downloadRecording(row)"
              >
                Download
              </UButton>
            </div>
          </template>
        </UTable>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <div>
            <UInput
              v-model="limit"
              type="number"
              min="1"
              max="50"
              class="w-20"
              @update:model-value="fetchRecordings"
            />
            <span class="ml-2 text-sm text-gray-500">recordings per page</span>
          </div>
          <div class="text-sm text-gray-500">
            {{ recordings.length }} recordings found
          </div>
        </div>
      </template>
    </UCard>

    <!-- Audio player (hidden) -->
    <audio
      ref="audioPlayer"
      class="hidden"
      controls
      @ended="stopPlaying"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { CallRecording } from '~/server/utils/providers/ringcentral'

// State management
const recordings = useState<CallRecording[]>('callRecordings', () => [])
const isLoading = useState<boolean>('callRecordingsLoading', () => false)
const error = useState<string | null>('callRecordingsError', () => null)
const isPlayingId = useState<string | null>('playingRecordingId', () => null)
const useMockData = useState<boolean>('useMockCallData', () => true)
const limit = useState<number>('recordingsLimit', () => 10)

// References
const audioPlayer = ref<HTMLAudioElement | null>(null)

// Table columns definition
const columns = [
  {
    key: 'direction',
    label: 'Direction'
  },
  {
    key: 'from',
    label: 'From',
    render: (row: CallRecording) => `${row.from?.name || ''} ${row.from?.phoneNumber || ''}`
  },
  {
    key: 'to',
    label: 'To',
    render: (row: CallRecording) => `${row.to?.name || ''} ${row.to?.phoneNumber || ''}`
  },
  {
    key: 'duration',
    label: 'Duration'
  },
  {
    key: 'startTime',
    label: 'Date & Time'
  },
  {
    key: 'actions',
    label: 'Actions'
  }
]

// Fetch recordings on component mount
onMounted(() => {
  fetchRecordings()
})

// Format duration from seconds to MM:SS
function formatDuration(seconds: number): string {
  if (!seconds) return '00:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Format date to a readable format
function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Toggle between mock and real data
function toggleMockData() {
  useMockData.value = !useMockData.value
  fetchRecordings()
}

// Fetch recordings from the API
async function fetchRecordings() {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch(`/api/callRecordings?mock=${useMockData.value}&limit=${limit.value}`)
    const result = await response.json()
    
    if (result.success) {
      recordings.value = result.data
    } else {
      error.value = result.error || 'Failed to fetch recordings'
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred while fetching recordings'
  } finally {
    isLoading.value = false
  }
}

// Play a recording
async function playRecording(recording: CallRecording) {
  if (!audioPlayer.value) return
  
  try {
    isPlayingId.value = recording.id
    
    // Get the audio URL
    const audioUrl = `/api/callRecordings/${recording.id}?content=true&mock=${useMockData.value}`
    
    // Set the audio source and play
    audioPlayer.value.src = audioUrl
    await audioPlayer.value.play()
  } catch (err) {
    console.error('Error playing recording:', err)
    stopPlaying()
  }
}

// Stop playing
function stopPlaying() {
  isPlayingId.value = null
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
}

// Download a recording
function downloadRecording(recording: CallRecording) {
  const downloadUrl = `/api/callRecordings/${recording.id}?content=true&mock=${useMockData.value}`
  
  // Create a temporary link element and trigger download
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `recording-${recording.id}.mp3`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<style scoped>
.call-recordings-container {
  width: 100%;
}
</style>
