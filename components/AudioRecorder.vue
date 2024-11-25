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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // Create audio context for advanced audio processing
    audioContextRef.value = new AudioContext()
    const source = audioContextRef.value.createMediaStreamSource(stream)
    const processor = audioContextRef.value.createScriptProcessor(4096, 1, 1)

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
    // Optionally, show a toast or error message
  }
}

const stopRecording = async () => {
  if (mediaRecorderRef.value && isRecording.value) {
    mediaRecorderRef.value.stop()
    isRecording.value = false

    // Concatenate and encode audio
    const audioData = concatenateAudioBuffers(audioChunksRef.value)
    const wavBlob = encodeWavFile(
      audioData, 
      audioContextRef.value!.sampleRate
    )

    // Submit audio if callback provided
    if (props.onSubmit) {
      try {
        await props.onSubmit(wavBlob)
      } catch (error) {
        console.error('Error submitting audio:', error)
      }
    }

    // Clean up resources
    mediaRecorderRef.value.stream.getTracks().forEach(track => track.stop())
    audioContextRef.value?.close()
    audioChunksRef.value = []
  }
}

// Utility functions for audio encoding
const encodeWavFile = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // Write WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // Write audio data
  floatTo16BitPCM(view, 44, samples)

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
</script>
