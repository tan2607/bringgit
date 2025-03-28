<template>
  <UContainer class="mt-8">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-semibold">Medication Information Assistant</h1>
          <UButton v-if="queryHistory.length > 0" size="sm" color="gray" variant="ghost"
            @click="showHistory = !showHistory">
            <template #leading>
              <UIcon :name="showHistory ? 'i-lucide-chevron-up' : 'i-lucide-history'" />
            </template>
            {{ showHistory ? 'Hide History' : 'Show History' }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">
          Ask questions about medications and get accurate information from our database. The information is sourced
          from
          HealthHub Singapore's medication guides.
        </p>

        <UCollapse v-model="showHistory" v-if="queryHistory.length > 0">
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 class="font-medium mb-2">Previous Questions</h3>
            <div class="space-y-2">
              <div v-for="(item, index) in queryHistory" :key="index" class="flex items-center gap-2">
                <UButton size="xs" color="gray" variant="soft" @click="loadFromHistory(item)"
                  class="flex-grow text-left justify-start">
                  <template #leading>
                    <UIcon name="i-lucide-refresh-cw" />
                  </template>
                  <span class="truncate">{{ item.query }}</span>
                </UButton>
                <UButton size="xs" color="gray" variant="ghost" icon="i-lucide-x" @click="removeFromHistory(index)" />
              </div>
            </div>
          </div>
        </UCollapse>

        <div class="flex flex-wrap gap-2 mb-4">
          <UButton v-for="(sample, index) in sampleQuestions" :key="index" size="sm" color="gray" variant="soft"
            @click="query = sample" :disabled="loading">
            {{ sample.length > 50 ? sample.substring(0, 50) + '...' : sample }}
          </UButton>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <UFormGroup label="Your Question" name="query">
            <UTextarea v-model="query" placeholder="e.g., What are the side effects of Amiloride?" :rows="3"
              class="w-full" :disabled="loading" @keydown.enter.ctrl.prevent="askMedication" />
            <template #hint>
              <span class="text-xs text-gray-500">Press Ctrl+Enter to submit</span>
            </template>
          </UFormGroup>

          <div class="flex justify-end mt-4 gap-2">
            <UButton v-if="query.trim()" color="gray" variant="soft" :disabled="loading" @click="query = ''">
              Clear
            </UButton>
            <UButton color="primary" :loading="loading" :disabled="!query.trim() || loading" @click="askMedication">
              <template #leading>
                <UIcon name="i-lucide-search" />
              </template>
              Get Answer
            </UButton>
          </div>
        </div>
      </div>
    </UCard>


    <div v-if="loading && !response" class="mt-6">
      <UCard>
        <div class="flex items-center justify-center p-4">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-gray-400" />
          <span class="ml-2 text-gray-500">Searching medication information...</span>
        </div>
      </UCard>
    </div>

    <div v-if="response" class="mt-6">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">Answer</h2>
            <UButton size="xs" color="gray" variant="ghost" icon="i-lucide-copy" @click="copyToClipboard"
              :loading="copying" />
          </div>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <MDC :value="response" />
        </div>
      </UCard>
    </div>

    <div v-if="error" class="mt-6">
      <UAlert title="Error" color="red" variant="soft" icon="i-lucide-alert-circle">
        {{ error }}
      </UAlert>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const toast = useToast()
definePageMeta({
  middleware: ['auth']
})

interface HistoryItem {
  query: string;
  response: string;
  timestamp: string;
}

const query = ref('')
const response = ref('')
const loading = ref(false)
const error = ref('')
const copying = ref(false)
const showHistory = ref(false)

// Store query history in local storage
const queryHistory = ref<HistoryItem[]>([])

// Load history from localStorage on component mount
onMounted(() => {
  try {
    const savedHistory = localStorage.getItem('medication-query-history')
    if (savedHistory) {
      queryHistory.value = JSON.parse(savedHistory)
    }
  } catch (err) {
    console.error('Error loading history from localStorage:', err)
  }
})

// Save history to localStorage whenever it changes
watch(queryHistory, (newHistory) => {
  try {
    localStorage.setItem('medication-query-history', JSON.stringify(newHistory))
  } catch (err) {
    console.error('Error saving history to localStorage:', err)
  }
}, { deep: true })

const sampleQuestions = [
  'What are the side effects of Amiloride?',
  'How should I take Cyclosporin eye drops?',
  'What precautions should I take when using Atropine eye drops?',
  'What is Diquafosol Sodium used for?',
  'What are NSAIDs eye preparations used for?'
]

function loadFromHistory(item: HistoryItem) {
  query.value = item.query
  response.value = item.response
}

function removeFromHistory(index: number) {
  queryHistory.value.splice(index, 1)
}

async function copyToClipboard() {
  if (!response.value) return

  copying.value = true
  try {
    await navigator.clipboard.writeText(response.value)
    // Show toast or notification if available
    toast.add({
      title: 'Copied to clipboard',
      description: 'The response has been copied to your clipboard',
      color: 'success',
      icon: 'i-lucide-check',
      duration: 3000
    })
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  } finally {
    copying.value = false
  }
}

async function askMedication() {
  if (!query.value.trim()) return

  loading.value = true
  error.value = ''
  response.value = ''

  try {
    const result = await $fetch('/api/medication', {
      method: 'POST',
      body: {
        query: query.value
      }
    })

    if (result.success) {
      response.value = result.data

      // Add to history (avoid duplicates)
      const isDuplicate = queryHistory.value.some(item => item.query === query.value)
      if (!isDuplicate) {
        queryHistory.value.unshift({
          query: query.value,
          response: result.data,
          timestamp: new Date().toISOString()
        })

        // Limit history size
        if (queryHistory.value.length > 10) {
          queryHistory.value = queryHistory.value.slice(0, 10)
        }
      }
    } else {
      error.value = result.error || 'Failed to get medication information'
    }
  } catch (err: any) {
    console.error('Error fetching medication information:', err)
    error.value = err.message || 'An error occurred while processing your request'

    toast.add({
      title: 'Error',
      description: err.message || 'This demo is rate limited: Please try again later after 1 minute.',
      color: 'danger',
      icon: 'i-lucide-alert-circle',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>
