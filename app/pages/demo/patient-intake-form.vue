<template>
  <UContainer>
    <div class="flex justify-between items-center mb-6 mt-8">
        <h1 class="text-2xl font-bold">{{ t('patient-intake.title') }}</h1>
      </div>
    <div>
      

      <div class="border rounded-lg p-4 mb-6 flex items-start gap-3 bg-primary-50 dark:bg-primary-950">
        <UIcon name="i-lucide-alert-circle" class="size-5 flex-shrink-0 mt-0.5" />
        <p class="text-sm">{{ t('patient-intake.instruction') }}</p>
      </div>

      <form class="max-w-4xl mx-auto space-y-6" @submit.prevent="handleSubmit">
        <!-- Reason for Visit Section -->
        <div class="rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t('patient-intake.reason-for-visit') }}</h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t('patient-intake.symptoms') }}</label>
              <div class="flex gap-2">
                <textarea
                  v-model="formData.symptoms"
                  rows="3"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t('patient-intake.symptoms-placeholder')"
                ></textarea>
                <UButton
                  icon="i-lucide-mic"
                  :color="recordingStates.symptoms ? 'primary' : 'gray'"
                  variant="ghost"
                  @click="handleMicClick('symptoms')"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t('patient-intake.start-time') }}</label>
              <div class="flex gap-2">
                <input
                  v-model="formData.startTime"
                  type="text"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t('patient-intake.start-time-placeholder')"
                >
                <UButton
                  icon="i-lucide-mic"
                  :color="recordingStates.startTime ? 'primary' : 'gray'"
                  variant="ghost"
                  @click="handleMicClick('startTime')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Medical History Section -->
        <div class="rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t('patient-intake.medical-history') }}</h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t('patient-intake.conditions') }}</label>
              <div class="flex gap-2">
                <textarea
                  v-model="formData.conditions"
                  rows="3"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t('patient-intake.conditions-placeholder')"
                ></textarea>
                <UButton
                  icon="i-lucide-mic"
                  :color="recordingStates.conditions ? 'primary' : 'gray'"
                  variant="ghost"
                  @click="handleMicClick('conditions')"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t('patient-intake.medications') }}</label>
              <div class="flex gap-2">
                <textarea
                  v-model="formData.medications"
                  rows="3"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t('patient-intake.medications-placeholder')"
                ></textarea>
                <UButton
                  icon="i-lucide-mic"
                  :color="recordingStates.medications ? 'primary' : 'gray'"
                  variant="ghost"
                  @click="handleMicClick('medications')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Lifestyle Section -->
        <div class="rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t('patient-intake.lifestyle') }}</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium">{{ t('patient-intake.smoking') }}</label>
                <div class="flex gap-2">
                  <input
                    v-model="formData.smoking"
                    type="text"
                    class="w-full p-3 border rounded-lg"
                  >
                  <UButton
                    icon="i-lucide-mic"
                    :color="recordingStates.smoking ? 'primary' : 'gray'"
                    variant="ghost"
                    @click="handleMicClick('smoking')"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium">{{ t('patient-intake.alcohol') }}</label>
                <div class="flex gap-2">
                  <input
                    v-model="formData.alcohol"
                    type="text"
                    class="w-full p-3 border rounded-lg"
                  >
                  <UButton
                    icon="i-lucide-mic"
                    :color="recordingStates.alcohol ? 'primary' : 'gray'"
                    variant="ghost"
                    @click="handleMicClick('alcohol')"
                  />
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t('patient-intake.activity') }}</label>
              <div class="flex gap-2">
                <input
                  v-model="formData.activity"
                  type="text"
                  class="w-full p-3 border rounded-lg"
                >
                <UButton
                  icon="i-lucide-mic"
                  :color="recordingStates.activity ? 'primary' : 'gray'"
                  variant="ghost"
                  @click="handleMicClick('activity')"
                />
              </div>
            </div>
          </div>
        </div>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
        >
          {{ t('patient-intake.submit') }}
        </UButton>
      </form>
    </div>
</UContainer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getLanguageIcon, languages } from '@@/i18n/languages'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = useToast()

// Language selection
const selectedLanguage = ref('en')
const isRecording = ref(false)
const activeRecordingField = ref('')
const quality = ref<'fast' | 'standard' | 'high'>('fast')
const formality = ref<'formal' | 'informal'>('formal')
const temperature = ref(0.2)
const mediaRecorder = ref<MediaRecorder | null>(null)

interface RecordingStates {
  symptoms: boolean
  startTime: boolean
  conditions: boolean
  medications: boolean
  smoking: boolean
  alcohol: boolean
  activity: boolean
}

// Form data
const formData = reactive({
  symptoms: '',
  startTime: '',
  conditions: '',
  medications: '',
  smoking: '',
  alcohol: '',
  activity: ''
})

const recordingStates = reactive<RecordingStates>({
  symptoms: false,
  startTime: false,
  conditions: false,
  medications: false,
  smoking: false,
  alcohol: false,
  activity: false
})

const handleLanguageChange = (e: Event) => {
  selectedLanguage.value = (e.target as HTMLSelectElement).value
}

const handleMicClick = async (field: keyof typeof formData) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    console.error('Media devices not supported')
    toast.add({
      title: 'Error',
      description: 'Your browser does not support voice recording',
      color: 'error'
    })
    return
  }

  if (recordingStates[field]) {
    // Stop recording
    recordingStates[field] = false
    activeRecordingField.value = ''
    if (mediaRecorder.value?.state === 'recording') {
      mediaRecorder.value.stop()
    }
  } else {
    // Start recording
    // Reset all other recording states
    Object.keys(recordingStates).forEach(key => {
      recordingStates[key as keyof typeof recordingStates] = false
    })
    recordingStates[field] = true
    activeRecordingField.value = field

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks: Blob[] = []

      const recorder = new MediaRecorder(stream)
      mediaRecorder.value = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        stream.getTracks().forEach(track => track.stop())
        await handleTranscription(audioBlob, field)
      }

      recorder.start()

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
          recordingStates[field] = false
          activeRecordingField.value = ''
        }
      }, 10000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.add({
        title: 'Error',
        description: 'Could not access microphone',
        color: 'error'
      })
      recordingStates[field] = false
      activeRecordingField.value = ''
    }
  }
}

const handleTranscription = async (audioBlob: Blob, field: keyof typeof formData) => {
  try {
    const audioFormData = new FormData()
    audioFormData.append('audio', audioBlob, 'recording.wav')
    const options = {
      targetLanguage: 'en',
      sourceLanguage: selectedLanguage.value,
      quality: quality.value,
      temperature: temperature.value,
      prompt: 'Translate medical terminology accurately and maintain formal tone',
      formality: formality.value
    }
    audioFormData.append('options', JSON.stringify(options))
    audioFormData.append('provider', 'whisper')

    const response = await fetch('/api/voice/translation', {
      method: 'POST',
      body: audioFormData
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Update the form field with the transcribed text
    formData[field] = `${data.translatedText} (${data.sourceText})`
  } catch (error) {
    console.error('Error transcribing audio:', error)
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Unknown error occurred',
      color: 'error'
    })
  }
}

const handleSubmit = () => {
  // Handle form submission logic here
  console.log('Form submitted:', formData)

  toast.add({
    title: t('success'),
    description: t('patient-intake.form-submitted'),
    color: 'success',
    duration: 1500
  })
}
</script>
