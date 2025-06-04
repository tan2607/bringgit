<template>
  <USlideover title="Call Transcript" v-model:open="open">

    <template #header>
      <div class="flex justify-between items-center space-x-4 px-2 w-full">
        <div class="flex items-center gap-2">
          <UButton 
            :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" 
            color="info" 
            variant="soft" 
            size="lg"
            class="rounded-full flex-shrink-0 shadow-sm" 
            @click="togglePlayback" 
          />
        </div>
        
        <div class="flex-1 min-w-0 mt-4">
          <USlider
            v-model="currentTime"
            :min="0"
            :max="duration"
            :step="0.1"
            color="info"
            class="w-full"
            @change="handleSeek"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="flex items-center space-x-2 flex-shrink-0">
          <div class="relative">
            <UDropdownMenu :items="speedOptions" :popper="{ placement: 'bottom-end' }">
              <UButton 
                :label="`${playbackSpeed}x`"
                color="neutral" 
                variant="ghost"
                size="sm"
                trailing-icon="i-lucide-chevron-down"
              />
              <template #item="{ item }">
                <button 
                  class="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  :class="{ 'bg-gray-100 dark:bg-gray-800': playbackSpeed === item.value }"
                  @click="setPlaybackSpeed(item.value)"
                >
                  {{ item.label }}
                </button>
              </template>
            </UDropdownMenu>
            
            <!-- Pitch change indicator -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform -translate-y-1 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-1 opacity-0"
            >
              <div 
                v-if="showPitchIndicator && playbackSpeed !== 1" 
                class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 dark:bg-gray-900 text-white rounded shadow-lg whitespace-nowrap"
              >
                {{ playbackSpeed > 1 ? 'Pitch increased' : 'Pitch decreased' }}
              </div>
            </Transition>
          </div>
          <UButton 
            icon="i-lucide-download" 
            color="neutral" 
            variant="ghost" 
            class="rounded-full" 
            @click="downloadRecording" 
          />
          <UButton 
            icon="i-lucide-x" 
            color="neutral" 
            variant="ghost" 
            @click="close" 
          />
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="call" class="h-full space-y-4">
        <!-- Contact Tags -->
        <!-- 
        <div class="flex flex-wrap gap-2">
          <UBadge color="neutral" variant="soft">Interest: {{ call.interest || 'Hang up' }}</UBadge>
          <UBadge color="neutral" variant="soft">Lead Status: {{ call.leadStatus || 'Busy' }}</UBadge>
          <UBadge color="neutral" variant="soft">Action Items: {{ call.actionItems || 'Call Back' }}</UBadge>
        </div> 
        -->

        <UCollapsible class="w-full" :default-open="true">
          <UButton
            label="Call Summary"
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-chevron-down"
            block
          />
          <template #content>
            <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mt-1">
              <MDC :value="call?.summary || 'No summary available'" />
            </div>
          </template>
        </UCollapsible>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto px-4 space-y-4">
          <template v-for="message in messages" :key="message.time">
            <!-- User Message -->
            <div v-if="message.role === 'user'" class="flex items-start space-x-2 space-x-reverse flex-row-reverse">
              <div class="flex-shrink-0 mt-1 float-end">
                <UAvatar icon="i-lucide-user" :alt="message.role" class="bg-green-100 dark:bg-green-900 shadow-sm" />
              </div>
              <div class="flex-1 max-w-[80%]">
                <div class="bg-green-50 dark:bg-green-900/50 rounded-2xl p-3 shadow-sm">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-green-500 dark:text-green-400 font-medium">User</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatTime(message.secondsFromStart) }}</span>
                  </div>
                  <UButton icon="i-lucide-audio-lines" size="xs" color="success" variant="ghost"
                       @click="jumpToTime(message.secondsFromStart)" /> 
                       <span class="text-sm text-gray-700 dark:text-gray-200">{{ message.message }}</span>
                </div>
              </div>
            </div>

            <!-- Bot Message -->
            <div v-else class="flex items-start space-x-2">
              <div class="flex-shrink-0 mt-1">
                <UAvatar icon="i-lucide-bot" :alt="message.role" class="bg-blue-100 dark:bg-blue-900 shadow-sm" />
              </div>
              <div class="flex-1 max-w-[80%]">
                <div class="bg-blue-50 dark:bg-blue-900/50 rounded-2xl p-3 shadow-sm">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-blue-500 dark:text-blue-400 font-medium">Assistant</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatTime(message.secondsFromStart) }}</span>
                  </div>
                  <UButton icon="i-lucide-audio-lines" size="xs" color="info" variant="ghost" @click="jumpToTime(message.secondsFromStart)" /> <span class="text-sm text-gray-700 dark:text-gray-200">{{ message.message }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div v-else class="p-4 text-center">No call selected</div>
    </template>

    <template #footer>
      <div class="flex justify-end items-center space-x-4">
        <UButton color="neutral" variant="soft" @click="close">
          Close
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useCalls } from '@/composables/useCalls'
import { useRecordingUrl } from '@/composables/useRecordingUrl'

const open = defineModel<boolean>('open')
const { selectedCall: call } = useCalls()
const { transformRecordingUrl } = useRecordingUrl()

const close = () => {
  emit('close')
}

const audio = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isAudioInitialized = ref(false)
const playbackSpeed = ref(1)
const showPitchIndicator = ref(false)

const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 }
]

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const initializeAudio = async () => {
  if (isAudioInitialized.value || !call.value?.recordingUrl) return

  try {
    const url = await transformRecordingUrl(call.value.recordingUrl)
    audio.value = new Audio(url)
    
    // Set up audio event listeners
    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value?.duration || 0
      isAudioInitialized.value = true
      console.log('🎵 Audio metadata loaded - Duration:', duration.value)
    })

    audio.value.addEventListener('timeupdate', () => {
      if (audio.value) {
        currentTime.value = audio.value.currentTime
      }
    })

    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
      currentTime.value = 0
    })

    // Load audio
    await audio.value.load()

    // Wait for metadata
    if (audio.value.readyState === 0) {
      await new Promise((resolve) => {
        audio.value!.addEventListener('loadedmetadata', resolve, { once: true })
      })
    }

    console.log('🎵 Audio initialized')
  } catch (error) {
    console.error('❌ Audio initialization error:', error)
    isAudioInitialized.value = false
  }
}

const handleSeek = async (value: number) => {
  if (!audio.value || !isAudioInitialized.value) return

  try {
    // Ensure value is a valid number and within bounds
    const seekTime = Math.max(0, Math.min(Number(value), duration.value))
    if (isNaN(seekTime)) {
      console.error('❌ Invalid seek time:', value)
      return
    }

    console.log('⏩ Seeking to:', formatTime(seekTime))
    
    // Pause audio before seeking
    const wasPlaying = isPlaying.value
    if (wasPlaying) {
      audio.value.pause()
    }

    // Set the time
    audio.value.currentTime = seekTime
    currentTime.value = seekTime

    // Resume if was playing
    if (wasPlaying) {
      await audio.value.play()
    }
  } catch (error) {
    console.error('❌ Seek error:', error)
  }
}

const togglePlayback = async () => {
  if (!audio.value || !isAudioInitialized.value) return

  try {
    if (isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
    } else {
      await audio.value.play()
      isPlaying.value = true
    }
  } catch (error) {
    console.error('❌ Playback error:', error)
    isPlaying.value = false
  }
}

const skipTime = (seconds: number) => {
  if (!audio.value || !isAudioInitialized.value) return

  const newTime = Math.max(0, Math.min(currentTime.value + seconds, duration.value))
  handleSeek(newTime)
}

const setPlaybackSpeed = (speed: number) => {
  if (!audio.value || !isAudioInitialized.value) return

  audio.value.playbackRate = speed
  playbackSpeed.value = speed
  
  // Show pitch indicator briefly
  showPitchIndicator.value = true
  setTimeout(() => {
    showPitchIndicator.value = false
  }, 2000)
}

const jumpToTime = async (seconds: number) => {
  if (!audio.value || !isAudioInitialized.value) return

  try {
    // Ensure seconds is a valid number and within bounds
    const timestamp = Math.max(0, Math.min(parseFloat(seconds.toString()), duration.value))
    if (isNaN(timestamp)) {
      console.error('❌ Invalid timestamp:', seconds)
      return
    }

    console.log('⏩ Jumping to timestamp:', formatTime(timestamp))
    
    // Use handleSeek for consistent behavior
    await handleSeek(timestamp)

    // Start playing if not already playing
    if (!isPlaying.value) {
      await audio.value.play()
      isPlaying.value = true
    }
  } catch (error) {
    console.error('❌ Jump to time error:', error)
  }
}

const downloadRecording = () => {
  if (call.value?.recordingUrl) {
    const proxyUrl = transformRecordingUrl(call.value.recordingUrl)
    window.open(proxyUrl, '_blank')
  }
}

const cleanupAudio = () => {
  if (audio.value) {
    audio.value.pause()
    audio.value.currentTime = 0
    audio.value.src = ''
    audio.value = null
  }
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  isAudioInitialized.value = false
}

// Initialize audio when call changes
watch(call, async () => {
  if (call.value?.recordingUrl) {
    await initializeAudio()
  }
}, { immediate: true })

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanupAudio()
})

// Watch for slideover close
watch(() => open, (isOpen) => {
  if (!isOpen) {
    cleanupAudio()
  }
})

const messages = computed(() => {
  if (!call.value?.messages) return []
  return call.value.messages.filter(msg =>
    msg.role === 'user' || msg.role === 'bot'
  )
})
</script>
