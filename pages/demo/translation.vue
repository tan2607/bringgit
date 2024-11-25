<script setup lang="ts">
import { getLanguageIcon, languages } from '@/i18n/languages'

const { t } = useI18n()
const toast = useToast()

interface TranslationHistoryItem {
  sourceText: string
  translatedText: string
  sourceLanguage: typeof languages[0]
  targetLanguage: typeof languages[0]
  timestamp: Date
}

const sourceText = ref('')
const translatedText = ref('')
const sourceLanguage = ref(languages[0])
const targetLanguage = ref(languages[1])
const isTranslating = ref(false)
const history = ref<TranslationHistoryItem[]>([])
const quality = ref<'draft' | 'standard' | 'high'>('standard')
const formality = ref<'formal' | 'informal'>('formal')
const temperature = ref(0.0)

// Handle voice recording submission
const handleVoiceRecording = async (blob: Blob) => {
  if (!blob) return
  await translateVoice(blob)
}

// Translate voice recording
const translateVoice = async (blob: Blob) => {
  isTranslating.value = true
  try {
    const formData = new FormData()
    formData.append('audio', blob, 'recording.wav')
    formData.append('options', JSON.stringify({
      targetLanguage: targetLanguage.value.code,
      sourceLanguage: sourceLanguage.value.code,
      quality: quality.value,
      temperature: temperature.value,
      prompt: 'Translate medical terminology accurately',
      formality: formality.value
    }))
    formData.append('provider', 'whisper')

    const response = await $fetch('/api/voice/translation', {
      method: 'POST',
      body: formData
    })

    if (response.error) {
      throw new Error(response.error)
    }

    sourceText.value = response.text
    translatedText.value = response.text

    // Add to history
    history.value.unshift({
      sourceText: sourceText.value,
      translatedText: translatedText.value,
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
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

// Play translated text using speech synthesis
const playTranslatedText = () => {
  if (!translatedText.value) return
  
  const utterance = new SpeechSynthesisUtterance(translatedText.value)
  utterance.lang = targetLanguage.value.code
  window.speechSynthesis.speak(utterance)
}

// Copy translation to clipboard
const copyTranslation = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: t('copied'),
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: t('copy-error'),
      description: error instanceof Error ? error.message : t('unknown-error'),
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">{{ t('translation-demo') }}</h1>
      
      <!-- Language Selection -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="font-medium">{{ t('source-text') }}</label>
          <USelectMenu
            v-model="sourceLanguage"
            placeholder="Select source language"
            labelKey="name"
            :items="languages"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            :icon="getLanguageIcon(sourceLanguage.code)"
            class="w-full"
          >
            <template #item="{ item }">
              <div class="flex items-center gap-2">
                <UIcon :name="getLanguageIcon(item.code)" />
                {{ item.name }}
              </div>
            </template>
          </USelectMenu>
        </div>
        
        <div class="space-y-2">
          <label class="font-medium">{{ t('translated-text') }}</label>
          <USelectMenu
            v-model="targetLanguage"
            :items="languages"
            labelKey="name"
            placeholder="Select target language"
            :icon="getLanguageIcon(targetLanguage.code)"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            class="w-full"
          >
            <template #item="{ item }">
              <div class="flex items-center gap-2">
                <UIcon :name="getLanguageIcon(item.code)" />
                {{ item.name }}
              </div>
            </template>
          </USelectMenu>
        </div>
      </div>

      <!-- Translation Quality -->
      <div class="mb-4">
        <label class="font-medium block mb-2">{{ t('translation-quality') }}</label>
        <URadio v-model="quality" name="quality" value="draft" label="Draft" class="mr-4" />
        <URadio v-model="quality" name="quality" value="standard" label="Standard" class="mr-4" />
        <URadio v-model="quality" name="quality" value="high" label="High" />
      </div>

      <!-- Translation Options -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="font-medium block mb-2">{{ t('formality') }}</label>
          <URadio v-model="formality" name="formality" value="formal" label="Formal" class="mr-4" />
          <URadio v-model="formality" name="formality" value="informal" label="Informal" />
        </div>
        <div>
          <label class="font-medium block mb-2">{{ t('temperature') }}</label>
          <URange v-model="temperature" :min="0" :max="1" :step="0.1" />
        </div>
      </div>

      <!-- Voice Recording -->
      <div class="mb-4">
        <AudioRecorder @recording-complete="handleVoiceRecording" />
      </div>

      <!-- Translation Results -->
      <div v-if="sourceText || translatedText" class="space-y-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">{{ sourceLanguage.name }}</h3>
            <UButton
              icon="i-heroicons-clipboard"
              variant="ghost"
              :title="t('copy')"
              @click="copyTranslation(sourceText)"
            />
          </div>
          <p>{{ sourceText }}</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">{{ targetLanguage.name }}</h3>
            <div class="flex gap-2">
              <UButton
                icon="i-heroicons-speaker-wave"
                variant="ghost"
                :title="t('play')"
                @click="playTranslatedText"
              />
              <UButton
                icon="i-heroicons-clipboard"
                variant="ghost"
                :title="t('copy')"
                @click="copyTranslation(translatedText)"
              />
            </div>
          </div>
          <p>{{ translatedText }}</p>
        </div>
      </div>

      <!-- Translation History -->
      <div v-if="history.length" class="mt-8">
        <h2 class="text-xl font-bold mb-4">{{ t('history') }}</h2>
        <div class="space-y-4">
          <div v-for="item in history" :key="item.timestamp.toISOString()" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-500">{{ item.timestamp.toLocaleTimeString() }}</span>
              <span class="text-sm">{{ item.sourceLanguage.name }} → {{ item.targetLanguage.name }}</span>
            </div>
            <p class="mb-2">{{ item.sourceText }}</p>
            <p class="font-medium">{{ item.translatedText }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>