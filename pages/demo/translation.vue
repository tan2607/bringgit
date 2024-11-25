<!-- Emergency department patient intake workflow
As a business analyst project manager who is working on a workflow for solving the problem below for the emergency department of a hospital, help me create a workflow and PRD for my engineers to work on a prototype.
Problem: 
in their emergency department ED, 20-25% of patients dont speak english. 
languages  commonly used: Chinese, vietnamese, arabic (total between 4-7 languages)
 
Solution:
The hospital staff were initially looking for a live translation tool for use between the patient and clinician. but it is not feasible.
 
They can also use a patient intake tool like what we have to collect the patients' complaints and do the translation and analysis.
It is similar to the AI doctor tool, just without the doctor. 
Ideally the patients can talk/verbalize, which can be speech to text before translated, as some may not be good at texting. 
The voice enabled tool should allow the users to choose their language, and be asked verbally to answer questions about their symptoms, and also about their medical history.
include questions that are typical questions for patient intake form at the emergency department. It should not be too long and be layman friendly:
* Medical history: Current condition, medications, allergies, surgeries, chronic illnesses 
   * Previous surgeries or hospitalizations
   * Chronic illnesses or conditions (e.g., diabetes, hypertension)
   * Allergies (especially drug allergies)
   * Current medications (including over-the-counter medications, supplements, and herbs)
   * Family Medical History:
   * Health conditions prevalent in the family, which could be hereditary or relevant for risk assessment (e.g., heart disease, diabetes, cancers).
* Reason for visit: Why the patient is visiting the emergency department . e.g. Specific symptoms or concerns that prompted the visit or appointment
and  Duration and severity of these symptoms
* Lifestyle choices: Habits like smoking, alcohol consumption, recreational drug use
* Physical activity levels
* Diet
-----------------------------------------------------------------
I'll help create a PRD for an Emergency Department Multilingual Patient Intake System (ED-MPIS), leveraging the structure from the K-MOB PRD but tailored for this specific healthcare use case.

Emergency Department Multilingual Patient Intake System PRD
Click to open document

I've created a comprehensive PRD for the Emergency Department Multilingual Patient Intake System. The document outlines the key requirements, workflows, and considerations for building a prototype that addresses the specific needs of non-English speaking patients in the ED setting.
Key features I've included:
Voice-first interface with support for multiple languages
Structured intake workflow that covers essential medical information
Real-time translation with medical terminology verification
Integration with existing hospital systems
HIPAA compliance and security measures
Would you like me to elaborate on any particular section or add specific requirements that I might have missed?
CopyRetry

------------------------------------------------------------------------
keyreply's job is to provide an API that can be launched in a website URL to start interacting with the patient on the patient's mobile phone. the voice AI will ask the questions via voice in their native language and will also display the questions on the screen. 
the user will click on a button on the screen with a microphone picture and hold on to it while speaking.
it will go to and fro and the patient will click submit when completed and the staff will be able to see the submitted materials on their screen on an interface.
The staff can also reply to ask more questions in english, also to click on a button on the screen with a microphone picture and hold on to it while speaking.
the keyreply API will translate it into the language the patient is speaking  and receive input in the patient's native language. Then the staff can receive both the answers in native language and in english (translated).
Describe the above workflow clearly and also in a workflow diagram.
Also create a sample User interface diagram
--------------------------------------------------------------------
I'll help create a clear workflow diagram using Mermaid and design a sample UI using React.

ED Multilingual Patient Intake Workflow
Click to open diagram

Now, let's create a UI mockup showing both the patient and staff interfaces:

ED Multilingual Patient Intake Interface
Click to open component

Let me explain the workflow in detail:
Initial Access
Hospital staff provides patient with a URL
Patient opens URL on their mobile device
System presents language selection interface
Patient Intake Process
AI begins asking questions in patient's selected language
Questions are both spoken aloud and displayed on screen
Patient interaction:
Sees/hears question in their language
Holds microphone button to respond
Can see their response transcribed
Can verify translation accuracy
Process continues until all questions are answered
Patient submits completed form
Staff Interface
Staff sees responses in both:
Original language
English translation
Follow-up questions:
Staff holds mic button to ask in English
System translates to patient's language
Patient receives audio/text in their language
Patient responds in their language
Staff receives bilingual response
KeyReply API Integration Points
Speech-to-text conversion
Text-to-speech synthesis
Language translation
Session management
Secure data transmission
The UI mockup shows:
Patient View:
Clear language indicator
Large, accessible microphone button
Visual feedback for voice input
Bilingual display of responses
Simple submit button
Staff View:
Patient language indicator
Bilingual display of all interactions
Follow-up question interface
Clear response history
Would you like me to elaborate on any part of the workflow or modify the UI design to better match your requirements?

 -->

<template>
  <div class="container mx-auto p-4">
    <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">{{ t('translation-demo') }}</h1>
      
      <!-- Source Language Selection -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="font-medium">{{ t('source-text') }}</label>
          <USelect
            v-model="sourceLanguage"
            :options="languages"
            valueKey="code"
            labelKey="name"
          />
        </div>
        
        <!-- Target Language Selection -->
        <div class="space-y-2">
          <label class="font-medium">{{ t('translated-text') }}</label>
          <USelect
            v-model="targetLanguage"
            :options="languages"
            valueKey="code"
            labelKey="name"
          />
        </div>
      </div>
      
      <!-- Source Text Area -->
      <div class="space-y-2 mb-4">
        <UTextarea
          v-model="sourceText"
          :rows="8"
          :placeholder="t('enter-text-to-translate')"
          class="w-full"
        />
      </div>
      
      <!-- Audio Recorder Component -->
      <AudioRecorder 
        :disabled="isTranslating"
        @submit="translateVoice"
      />
      
      <!-- Translated Text -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="font-medium">{{ t('translated-text') }}</label>
          <div class="flex items-center space-x-2">
            <UBadge 
              v-if="isPlaying" 
              color="primary" 
              variant="subtle"
            >
              {{ t('audio-playing') }}
            </UBadge>
          </div>
        </div>
        <UTextarea
          v-model="translatedText"
          :rows="8"
          :placeholder="t('translated-text-placeholder')"
          class="w-full"
          readonly
        />
      </div>
      
      <!-- Translation Button -->
      <div class="mt-4 flex justify-center">
        <UButton 
          :label="isTranslating ? t('translating') : t('translate-voice')"
          :disabled="isTranslating || (!sourceText && !audioBlob)"
          @click="translateText"
          block
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const { isPlaying, play, stop } = usePlayer()

interface Language {
  code: string
  name: string
}

interface TranslationHistoryItem {
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  timestamp: Date
}

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'ar', name: 'Arabic' }
]

const sourceText = ref('')
const translatedText = ref('')
const sourceLanguage = ref(languages[0])
const targetLanguage = ref(languages[9]) // Default to Chinese
const isTranslating = ref(false)
const history = ref<TranslationHistoryItem[]>([])
const audioInput = ref<File | null>(null)

const translate = async () => {
  if (!sourceText.value) return

  isTranslating.value = true
  try {
    // TODO: Implement actual translation API call
    // For demo, we'll just append some text
    await new Promise(resolve => setTimeout(resolve, 1000))
    translatedText.value = `[${targetLanguage.value.name}] ${sourceText.value}`
    
    // Add to history
    history.value.unshift({
      sourceText: sourceText.value,
      translatedText: translatedText.value,
      sourceLanguage: sourceLanguage.value.name,
      targetLanguage: targetLanguage.value.name,
      timestamp: new Date()
    })
  } catch (error) {
    toast.add({
      title: t('translation-error'),
      description: error instanceof Error ? error.message : t('unknown-error'),
      color: 'error'
    })
  } finally {
    isTranslating.value = false
  }
}

const copyTranslation = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: t('copied-to-clipboard'),
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: t('copy-error'),
      color: 'error'
    })
  }
}

const translateVoice = async (audioBlob: Blob) => {
  if (!audioBlob) {
    toast.add({
      title: t('no-audio'),
      description: t('please-record-audio'),
      color: 'error'
    })
    return
  }

  isTranslating.value = true
  try {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')
    formData.append('sourceLanguage', sourceLanguage.value.code)
    formData.append('targetLanguage', targetLanguage.value.code)

    const response = await $fetch('/api/voice-translation', {
      method: 'POST',
      body: formData
    })

    // Update UI with translation results
    sourceText.value = response.transcript
    translatedText.value = response.translation

    // Optional: Play synthesized audio if available
    if (response.audioStream) {
      await play(response.audioStream, () => {
        // Optional callback when audio playback is complete
        console.log('Audio playback finished')
      })
    }

    // Add to history
    history.value.unshift({
      sourceText: response.transcript,
      translatedText: response.translation,
      sourceLanguage: sourceLanguage.value.code,
      targetLanguage: targetLanguage.value.code,
      timestamp: new Date()
    })
  } catch (error) {
    toast.add({
      title: t('translation-error'),
      description: error instanceof Error ? error.message : t('unknown-error'),
      color: 'error'
    })
  } finally {
    isTranslating.value = false
  }
}
</script>
