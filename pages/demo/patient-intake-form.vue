<template>
  <div class="container mx-auto p-4 m-4">
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <div class="flex items-center gap-4">
          <select 
            class="p-2 border rounded-lg flex items-center gap-2"
            :value="selectedLanguage"
            @change="handleLanguageChange"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="border rounded-lg p-4 mb-6 flex items-start gap-3 bg-primary-50 dark:bg-primary-950">
        <UIcon name="i-lucide-alert-circle" class="size-5 flex-shrink-0 mt-0.5" />
        <p class="text-sm">{{ t.instruction }}</p>
      </div>

      <form class="max-w-4xl mx-auto space-y-6" @submit.prevent="handleSubmit">
        <!-- Reason for Visit Section -->
        <div class="rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t.reasonForVisit }}</h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t.symptoms }}</label>
              <div class="flex gap-2">
                <textarea
                  v-model="formData.symptoms"
                  rows="3"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t.symptomsPlaceholder"
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
              <label class="block text-sm font-medium">{{ t.startTime }}</label>
              <div class="flex gap-2">
                <input
                  v-model="formData.startTime"
                  type="text"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t.startTimePlaceholder"
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
          <h2 class="text-xl font-semibold mb-4">{{ t.medicalHistory }}</h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium">{{ t.conditions }}</label>
              <div class="flex gap-2">
                <textarea
                  v-model="formData.conditions"
                  rows="3"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t.conditionsPlaceholder"
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
              <label class="block text-sm font-medium">{{ t.medications }}</label>
              <div class="flex gap-2">
                <textarea
                  v-model="formData.medications"
                  rows="3"
                  class="w-full p-3 border rounded-lg"
                  :placeholder="t.medicationsPlaceholder"
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
          <h2 class="text-xl font-semibold mb-4">{{ t.lifestyle }}</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium">{{ t.smoking }}</label>
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
                <label class="block text-sm font-medium">{{ t.alcohol }}</label>
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
              <label class="block text-sm font-medium">{{ t.activity }}</label>
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
          {{ t.submit }}
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getLanguageIcon, languages } from '@/i18n/languages'
import { useCartesiaPlayer } from '@/composables/useCartesiaPlayer'

const toast = useToast()
const cartesiaPlayer = useCartesiaPlayer()

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

const translations = {
  en: {
    title: "Emergency Department Patient Intake",
    instruction: "You can either type your answers or click the microphone icon to speak. Your responses will be recorded in both your chosen language and English.",
    reasonForVisit: "Reason for Visit",
    symptoms: "What brings you to the Emergency Department today?",
    symptomsPlaceholder: "Describe your main symptoms or concerns...",
    startTime: "When did these symptoms start?",
    startTimePlaceholder: "e.g., 2 hours ago, yesterday morning...",
    medicalHistory: "Medical History",
    conditions: "Do you have any chronic medical conditions?",
    conditionsPlaceholder: "e.g., diabetes, high blood pressure, heart disease...",
    medications: "List any medications you are currently taking:",
    medicationsPlaceholder: "Include prescriptions, over-the-counter medications, supplements...",
    lifestyle: "Lifestyle & Habits",
    smoking: "Do you smoke?",
    alcohol: "Do you drink alcohol?",
    activity: "How would you describe your physical activity level?",
    submit: "Submit Form",
    holdToSpeak: "Hold to speak",
    translateLabel: "Translation"
  },
  zh: {
    title: "急诊部门患者登记",
    instruction: "您可以输入答案或点击麦克风图标说话。您的回答将以您选择的语言和英语记录。",
    reasonForVisit: "就医原因",
    symptoms: "您今天为什么来急诊？",
    symptomsPlaceholder: "请描述您的主要症状或担忧...",
    startTime: "这些症状什么时候开始的？",
    startTimePlaceholder: "例如：2小时前，昨天早上...",
    medicalHistory: "病史",
    conditions: "您有慢性病吗？",
    conditionsPlaceholder: "例如：糖尿病，高血压，心脏病...",
    medications: "请列出您目前正在服用的药物：",
    medicationsPlaceholder: "包括处方药，非处方药，补充剂...",
    lifestyle: "生活方式和习惯",
    smoking: "您吸烟吗？",
    alcohol: "您喝酒吗？",
    activity: "您如何描述您的体育活动水平？",
    submit: "提交表格",
    holdToSpeak: "按住说话",
    translateLabel: "翻译"
  },
  vi: {
    title: "Tiếp nhận Bệnh nhân Khoa Cấp cứu",
    instruction: "Bạn có thể nhập câu trả lời hoặc nhấp vào biểu tượng micrô để nói. Câu trả lời của bạn sẽ được ghi lại bằng ngôn ngữ bạn chọn và tiếng Anh.",
    reasonForVisit: "Lý do khám",
    symptoms: "Điều gì đưa bạn đến Khoa Cấp cứu hôm nay?",
    symptomsPlaceholder: "Mô tả các triệu chứng chính hoặc lo ngại của bạn...",
    startTime: "Khi nào những triệu chứng này bắt đầu?",
    startTimePlaceholder: "Ví dụ: 2 giờ trước, sáng hôm qua...",
    medicalHistory: "Tiền sử bệnh",
    conditions: "Bạn có bệnh mãn tính nào không?",
    conditionsPlaceholder: "Ví dụ: tiểu đường, huyết áp cao, bệnh tim...",
    medications: "Liệt kê các loại thuốc bạn đang dùng:",
    medicationsPlaceholder: "Bao gồm thuốc kê đơn, thuốc không kê đơn, thực phẩm chức năng...",
    lifestyle: "Lối sống và Thói quen",
    smoking: "Bạn có hút thuốc không?",
    alcohol: "Bạn có uống rượu không?",
    activity: "Bạn mô tả mức độ hoạt động thể chất của mình như thế nào?",
    submit: "Gửi biểu mẫu",
    holdToSpeak: "Giữ để nói",
    translateLabel: "Bản dịch"
  }
}

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
    title: 'Success',
    description: 'Patient intake form submitted successfully',
    color: 'success',
    duration: 1500
  })
}

const t = computed(() => translations[selectedLanguage.value])
</script>
