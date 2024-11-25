<script setup lang="ts">
import { getLanguageIcon, languages } from '@/i18n/languages'

const { t } = useI18n()
const toast = useToast()

interface TranslationHistoryItem {
  sourceText: string
  translatedText: string
  sourceLanguage: typeof languages[0]
  timestamp: Date
}

const sourceText = ref('')
const translatedText = ref('')
const sourceLanguage = ref(languages[1])
const isTranslating = ref(false)
const history = ref<TranslationHistoryItem[]>([])
const quality = ref<'fast' | 'standard' | 'high'>('fast')
const formality = ref<'formal' | 'informal'>('formal')
const temperature = ref(0.2)
const showAdvancedOptions = ref(false)
const isPlayingTranslation = ref(false)
const isPlayingSource = ref(false)
const autoPlayTranslation = ref(true)

const supportedTTSLanguages = ['en', 'fr', 'de', 'es', 'pt', 'zh', 'ja', 'hi', 'it', 'ko', 'nl', 'pl', 'ru', 'sv', 'tr']

const cartesiaPlayer = useCartesiaPlayer()

// Computed property to check if source language is supported for TTS
const isSourceLanguageSupported = computed(() => {
  return supportedTTSLanguages.includes(sourceLanguage.value.code)
})

// Handle voice recording submission
const handleSubmit = async (audioBlob: Blob) => {
  try {
    isTranslating.value = true
    await translateVoice(audioBlob)
  } catch (error) {
    console.error('Error handling voice recording submission:', error)
  } finally {
    isTranslating.value = false
  }
}

// Translate voice recording to English
const translateVoice = async (blob: Blob) => {
  console.log('Translating voice recording to English...')
  try {
    const formData = new FormData()
    formData.append('audio', blob, 'audio.wav')
    formData.append('options', JSON.stringify({
      targetLanguage: 'en',
      sourceLanguage: sourceLanguage.value.code,
      quality: quality.value,
      temperature: temperature.value,
      prompt: 'Translate medical terminology accurately and maintain formal tone',
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

    sourceText.value = response.sourceText
    translatedText.value = response.translatedText

    // Auto-play translation if enabled
    if (autoPlayTranslation.value) {
      await playTranslation(response.translatedText)
    }

    // Add to history
    history.value.unshift({
      sourceText: sourceText.value,
      translatedText: translatedText.value,
      sourceLanguage: sourceLanguage.value,
      timestamp: new Date()
    })
  } catch (error) {
    toast.add({
      title: t('translation-error'),
      description: error instanceof Error ? error.message : t('unknown-error'),
      color: 'error'
    })
  }
}

// Add TTS functionality
const playTranslation = async (text: string) => {
  try {
    isPlayingTranslation.value = true
    console.log('[Translation Demo] Requesting TTS for text:', text);
    
    const response = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/octet-stream'
      },
      body: JSON.stringify({
        text,
        provider: 'cartesia',
        options: {
          voice: 'cd954dcd-b2c1-4990-aaaa-4602ed6723df'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Received empty audio data');
    }

    console.log('[Translation Demo] Playing with Cartesia WebPlayer');
    await cartesiaPlayer.play(arrayBuffer);

    // player.play(await response.arrayBuffer());
    isPlayingTranslation.value = false;
  } catch (error) {
    console.error('[Translation Demo] TTS error:', error)
    isPlayingTranslation.value = false
    toast.error('Failed to play audio')
  }
}

// Add TTS functionality
const playSource = async (text: string) => {
  try {
    isPlayingSource.value = true
    console.log('[Translation Demo] Requesting TTS for text:', text);
    
    const response = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/octet-stream'
      },
      body: JSON.stringify({
        text,
        provider: 'cartesia',
        options: {
          voice: '3d3550a7-2b11-4ac9-8363-e8fb6ec4ec8d',
          language: sourceLanguage.value.code || 'zh'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Received empty audio data');
    }

    console.log('[Translation Demo] Playing with Cartesia WebPlayer');
    await cartesiaPlayer.play(arrayBuffer);

    // player.play(await response.arrayBuffer());
    isPlayingSource.value = false;
  } catch (error) {
    console.error('[Translation Demo] TTS error:', error)
    isPlayingSource.value = false
    toast.error('Failed to play audio')
  }
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
      <h1 class="text-2xl font-bold mb-4 text-center">{{ t('universal-patient-translator') }}</h1>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-6">
        Speak in any language and get instant English translation
      </p>

      <!-- Voice Recording -->
      <div class="flex justify-center mb-8">
        <AudioRecorder
          :disabled="isTranslating"
          @submit="handleSubmit"
        />
      </div>

      <!-- Translation Result -->
      <div v-if="translatedText" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-500">Original Text</span>
          <div class="flex gap-2">
          <UButton
            icon="i-lucide-clipboard"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="copyTranslation(sourceText)"
          />
          <UButton
            v-if="isSourceLanguageSupported"
            :icon="isPlayingSource ? 'i-lucide-stop-circle' : 'i-lucide-play-circle'"
            color="neutral"
            variant="ghost"
            size="xs"
            :loading="isPlayingSource"
            @click="playSource(sourceText)"
          />
            </div>
        </div>
        <p class="text-lg">{{ sourceText }}</p>

        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-500">English Translation</span>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-clipboard"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="copyTranslation(translatedText)"
            />
            <UButton
              :icon="isPlayingTranslation ? 'i-lucide-stop-circle' : 'i-lucide-play-circle'"
              color="neutral"
              variant="ghost"
              size="xs"
              :loading="isPlayingTranslation"
              @click="playTranslation(translatedText)"
            />
          </div>
        </div>
        <p class="text-lg">{{ translatedText }}</p>
      </div>

      <!-- Advanced Options -->
      <UCollapsible class="mb-4">
        <template #default="{ open }">
          <UButton
            :label="t('advanced-options')"
            color="gray"
            variant="soft"
            block
            class="mb-2"
            @click="showAdvancedOptions = !showAdvancedOptions"
          >
            <template #trailing>
              <UIcon
                :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="w-4 h-4 transition-transform"
              />
            </template>
          </UButton>
        </template>
        <template #content>
          <div class="space-y-4 p-4">
            <!-- Source Language Selection -->
            <div class="space-y-2">
              <label class="font-medium">{{ t('source-language') }}</label>
              <USelectMenu
                v-model="sourceLanguage"
                :items="languages"
                labelKey="name"
                placeholder="Auto-detect language"
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

            <!-- Auto-play Translation Toggle -->
            <div class="flex items-center space-x-2">
              <UCheckbox 
                id="autoPlayTranslation"
                v-model="autoPlayTranslation"
              />
              <label for="autoPlayTranslation" class="text-sm font-medium">
                Auto-play English translation
              </label>
            </div>

            <!-- Quality and Formality Options -->
            <div class="grid grid-cols-2 gap-4">
              <URadioGroup
                v-model="quality"
                legend="Translation Quality"
                :items="[
                  { label: 'Fast', value: 'fast' },
                  { label: 'Standard', value: 'standard' },
                  { label: 'High', value: 'high' }
                ]"
                orientation="horizontal"
                class="w-full"
              />

              <URadioGroup
                v-model="formality"
                legend="Formality"
                :items="[
                  { label: 'Formal', value: 'formal' },
                  { label: 'Informal', value: 'informal' }
                ]"
                orientation="horizontal"
                class="w-full"
              />
            </div>

            <!-- Temperature Slider -->
            <div>
              <label class="font-medium block mb-2">{{ t('temperature') }}</label>
              <USlider v-model="temperature" :min="0" :max="1" :step="0.1" />
            </div>

          </div>
        </template>
      </UCollapsible>

      <!-- Translation History -->
      <div v-if="history.length" class="mt-8">
        <h2 class="text-xl font-bold mb-4">{{ t('history') }}</h2>
        <div class="space-y-4">
          <div
            v-for="item in history"
            :key="item.timestamp.toISOString()"
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <UIcon :name="getLanguageIcon(item.sourceLanguage.code)" class="w-4 h-4" />
                <span class="text-sm text-gray-500">
                  {{ item.sourceLanguage.name }} → English
                </span>
              </div>
              <span class="text-sm text-gray-500">
                {{ new Date(item.timestamp).toLocaleTimeString() }}
              </span>
            </div>
            <p class="text-lg mb-2">{{ item.translatedText }}</p>
            <div class="flex justify-end">
              <UButton
                icon="i-lucide-clipboard"
                color="gray"
                variant="ghost"
                size="xs"
                @click="copyTranslation(item.translatedText)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>