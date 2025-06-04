<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <UButton 
      v-if="!isRecording" 
      @click="startRecording" 
      :disabled="disabled"
      class="w-20 h-20 !rounded-full !p-0 flex items-center justify-center"
      color="primary"
    >
      <UIcon name="i-lucide-mic" class="w-8 h-8" />
    </UButton>
    
    <UButton 
      v-else 
      @click="stopRecording" 
      class="w-20 h-20 !rounded-full !p-0 flex items-center justify-center"
      color="error"
    >
      <UIcon name="i-lucide-stop-circle" class="w-8 h-8" />
    </UButton>
    
    <span class="text-sm text-gray-600">
      {{ isRecording ? t('recording') : t('press-to-speak') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  onSubmit?: (audioBlob: Blob) => Promise<void>
  disabled?: boolean
}>()

const isRecording = ref(false)
const mediaRecorderRef = shallowRef<MediaRecorder | null>(null)
const audioContextRef = shallowRef<AudioContext | null>(null)
const audioChunksRef = ref<Float32Array[]>([])

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000, // Lower sample rate, still good for speech
        echoCancellation: true,
        noiseSuppression: true,
      } 
    })
    
    // Create audio context with lower sample rate
    audioContextRef.value = new AudioContext({ sampleRate: 16000 })
    const source = audioContextRef.value.createMediaStreamSource(stream)
    
    // Smaller buffer size for processing
    const processor = audioContextRef.value.createScriptProcessor(2048, 1, 1)

    source.connect(processor)
    processor.connect(audioContextRef.value.destination)

    // Capture audio chunks
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      audioChunksRef.value.push(new Float32Array(inputData))
    }

    // Set up media recorder
    mediaRecorderRef.value = new MediaRecorder(stream)
    isRecording.value = true
  } catch (error) {
    console.error('Error accessing microphone:', error)
  }
}

const stopRecording = async () => {
  console.log('Stopping recording...')
  if (mediaRecorderRef.value && isRecording.value) {
    mediaRecorderRef.value.stop()
    isRecording.value = false

    // Concatenate and encode audio
    const audioData = concatenateAudioBuffers(audioChunksRef.value)
    const wavBlob = encodeWavFile(
      audioData, 
      audioContextRef.value!.sampleRate
    )

    // Log audio file size
    console.log('Audio file size:', {
      bytes: wavBlob.size,
      kilobytes: (wavBlob.size / 1024).toFixed(2) + ' KB',
      megabytes: (wavBlob.size / (1024 * 1024)).toFixed(2) + ' MB'
    })

    // Clean up resources
    mediaRecorderRef.value.stream.getTracks().forEach(track => track.stop())
    audioContextRef.value?.close()
    audioChunksRef.value = []

    // Submit audio if callback provided
    if (props.onSubmit) {
      try {
        await props.onSubmit(wavBlob)
      } catch (error) {
        console.error('Error submitting audio:', error)
      }
    }
  }
}

// Utility functions for audio encoding
const encodeWavFile = (samples: Float32Array, sampleRate: number): Blob => {
  // Downsample if needed
  const downsampledData = downsampleAudio(samples, sampleRate, 16000)
  
  const buffer = new ArrayBuffer(44 + downsampledData.length * 2)
  const view = new DataView(buffer)

  // Write WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + downsampledData.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // Mono channel
  view.setUint16(22, 1, true)
  view.setUint32(24, 16000, true) // Fixed sample rate
  view.setUint32(28, 16000 * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, downsampledData.length * 2, true)

  // Write audio data
  floatTo16BitPCM(view, 44, downsampledData)

  return new Blob([buffer], { type: 'audio/wav' })
}

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
}

const concatenateAudioBuffers = (buffers: Float32Array[]): Float32Array => {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0)
  const result = new Float32Array(totalLength)
  let offset = 0
  for (const buffer of buffers) {
    result.set(buffer, offset)
    offset += buffer.length
  }
  return result
}

// Add downsampling function
const downsampleAudio = (audioData: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array => {
  if (originalSampleRate === targetSampleRate) {
    return audioData
  }

  const ratio = originalSampleRate / targetSampleRate
  const newLength = Math.round(audioData.length / ratio)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const position = Math.round(i * ratio)
    result[i] = audioData[position]
  }

  return result
}
</script>
