<template>
  <USlideover v-model="slideover.isOpen" :ui="{ content: 'sm:max-w-7xl', footer: 'justify-end' }"
    title="Call Transcript">

    <template #header>
      <div class="flex justify-between items-center space-x-4 px-2">
        <UButton 
          :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" 
          color="info" 
          variant="soft" 
          size="lg"
          class="rounded-full flex-shrink-0" 
          @click="togglePlayback" 
        />
        
        <div class="flex-1 min-w-0 mt-4">
          <USlider
            v-model="currentTime"
            :min="0"
            :max="duration"
            :step="0.1"
            color="info"
            class="w-full"
            @change="seekTo"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="flex items-center space-x-2 flex-shrink-0">
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
        <div class="px-4">
          <div class="flex flex-wrap gap-2">
            <UBadge color="primary">Interest: {{ call.interest || 'Hang up' }}</UBadge>
            <UBadge color="primary">Lead Status: {{ call.leadStatus || 'Busy' }}</UBadge>
            <UBadge color="primary">Action Items: {{ call.actionItems || 'Call Back' }}</UBadge>
          </div>
        </div> 
        -->

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto px-4 space-y-6">
          <template v-for="message in messages" :key="message.time">
            <!-- User Message -->
            <div v-if="message.role === 'user'" class="flex items-start space-x-2 flex-row-reverse">
              <div class="flex-shrink-0 mt-1">
                <UAvatar size="sm" icon="i-lucide-user" :alt="message.role" class="bg-green-100" />
              </div>
              <div class="flex-1 max-w-[80%]">
                <div class="bg-green-50 rounded-2xl p-3 shadow-sm">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-green-500 font-medium">User</span>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-400">{{ formatTime(message.secondsFromStart) }}</span>
                  </div>
                  <UButton icon="i-lucide-audio-lines" size="xs" color="primary" variant="ghost"
                       @click="jumpToTime(message.secondsFromStart)" /> 
                       <span class="text-sm text-gray-700">{{ message.message }}</span>
                </div>
              </div>
            </div>

            <!-- Bot Message -->
            <div v-else class="flex items-start space-x-2">
              <div class="flex-shrink-0 mt-1">
                <UAvatar size="sm" icon="i-lucide-bot" :alt="message.role" class="bg-blue-100" />
              </div>
              <div class="flex-1 max-w-[80%]">
                <div class="bg-blue-50 rounded-2xl p-3 shadow-sm">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-blue-500 font-medium">Assistant</span>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-400">{{ formatTime(message.secondsFromStart) }}</span>
                  </div>
                  <UButton icon="i-lucide-audio-lines" size="xs" color="info" variant="ghost" @click="jumpToTime(message.secondsFromStart)" /> <span class="text-sm text-gray-700">{{ message.message }}</span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const { selectedCall: call } = useCalls()

const audio = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const slideover = ref({ isOpen: false })

// Audio control functions
const updateTime = () => {
  if (audio.value) {
    currentTime.value = audio.value.currentTime
    console.log('⏱️ Current time:', formatTime(currentTime.value))
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const seekTo = () => {
  const value = currentTime.value
  if (!audio.value) return
  
  try {
    console.log('⏩ Seeking to:', formatTime(value))
    audio.value.currentTime = value
    currentTime.value = value
  } catch (error) {
    console.error('❌ Seek error:', error)
  }
}

const togglePlayback = async () => {
  if (!audio.value) {
    console.log('❌ No audio instance available')
    return
  }
  
  try {
    if (isPlaying.value) {
      console.log('⏸️ Pausing audio')
      await audio.value.pause()
    } else {
      console.log('▶️ Starting playback')
      await audio.value.play()
    }
    isPlaying.value = !isPlaying.value
  } catch (error) {
    console.error('❌ Playback error:', error)
    isPlaying.value = false
  }
}

const jumpToTime = async (seconds: number) => {
  if (!audio.value) {
    console.log('❌ No audio instance available')
    return
  }
  
  try {
    console.log('⏩ Jumping to timestamp:', seconds)
    // Ensure seconds is a valid number
    const timestamp = parseFloat(seconds.toString())
    if (isNaN(timestamp)) {
      console.error('❌ Invalid timestamp:', seconds)
      return
    }

    // Ensure timestamp is within bounds
    if (timestamp < 0 || (duration.value && timestamp > duration.value)) {
      console.error('❌ Timestamp out of bounds:', timestamp)
      return
    }

    // Set the time and update UI
    audio.value.currentTime = timestamp - 1
    currentTime.value = timestamp
    console.log('✅ Jumped to:', formatTime(timestamp))

    // Start playing if not already playing
    if (!isPlaying.value) {
      console.log('▶️ Auto-starting playback after jump')
      await audio.value.play()
      isPlaying.value = true
    }
  } catch (error) {
    console.error('❌ Jump to time error:', error)
  }
}

const downloadRecording = () => {
  if (call.value?.recordingUrl) {
    window.open(call.value.recordingUrl, '_blank')
  }
}

const close = () => {
  if (audio.value) {
    audio.value.pause()
    isPlaying.value = false
  }
  slideover.value.isOpen = false
}

// Debug call object
watch(() => call.value, (newCall) => {
  console.log('📞 Call object changed:', newCall)
  console.log('🔗 Recording URL:', newCall?.recordingUrl)
}, { immediate: true })

// Initialize audio when call changes
watch(() => call.value?.recordingUrl, (newUrl) => {
  console.log('🎵 Recording URL changed:', newUrl)
  
  if (!newUrl) {
    console.log('⚠️ No recording URL provided')
    return
  }

  try {
    if (audio.value) {
      console.log('🔄 Cleaning up previous audio')
      audio.value.pause()
      audio.value.removeEventListener('timeupdate', updateTime)
      audio.value = null
      isPlaying.value = false
      currentTime.value = 0
      duration.value = 0
    }

    console.log('🎵 Creating new audio instance')
    const newAudio = new Audio()
    
    // Set up audio event listeners before setting src
    newAudio.addEventListener('timeupdate', updateTime)
    newAudio.addEventListener('loadedmetadata', () => {
      duration.value = newAudio.duration || 0
      console.log('📊 Audio metadata loaded - Duration:', duration.value)
    })
    newAudio.addEventListener('ended', () => {
      console.log('🏁 Audio playback ended')
      isPlaying.value = false
      currentTime.value = 0
    })
    newAudio.addEventListener('error', (e) => {
      console.error('❌ Audio error:', e, newAudio.error)
    })
    newAudio.addEventListener('waiting', () => {
      console.log('⏳ Audio is buffering...')
    })
    newAudio.addEventListener('playing', () => {
      console.log('▶️ Audio started playing')
    })
    newAudio.addEventListener('pause', () => {
      console.log('⏸️ Audio paused')
    })
    newAudio.addEventListener('canplaythrough', () => {
      console.log('✅ Audio can play through')
    })

    // Set the source and load
    newAudio.src = newUrl
    audio.value = newAudio
    
    console.log('🔄 Preloading audio...')
    newAudio.load()
  } catch (error) {
    console.error('❌ Error initializing audio:', error)
  }
}, { immediate: true })

// Clean up audio element
onUnmounted(() => {
  if (audio.value) {
    audio.value.pause()
    audio.value.removeEventListener('timeupdate', updateTime)
    audio.value = null
  }
})

// Filter messages to only show user and bot messages
const messages = computed(() => {
  if (!call.value?.messages) return []
  return call.value.messages.filter(msg =>
    msg.role === 'user' || msg.role === 'bot'
  )
})
</script>
