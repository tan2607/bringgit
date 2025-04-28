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
                <!-- History loading might need adjustment if you want to restore context -->
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
            @click="setQuery(sample)" :disabled="loading">
            {{ sample.length > 50 ? sample.substring(0, 50) + '...' : sample }}
          </UButton>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <UFormField label="Your Question" name="query">
            <UTextarea v-model="query" placeholder="e.g., What are the side effects of Amiloride? or follow-up like 'How should I take it?'"
              :rows="3" class="w-full" :disabled="loading" @keydown.enter.ctrl.prevent="askMedication" />
            <template #hint>
              <span class="text-xs text-gray-500">Press Ctrl+Enter to submit. Follow-up questions will use context from the previous answer.</span>
            </template>
          </UFormField>
          
          <!-- Format Selection -->
          <UFormField label="Response Format" name="format" class="mt-3">
            <URadioGroup v-model="responseFormat" :items="responseFormatOptions" :disabled="loading" />
          </UFormField>

          <div class="flex justify-between items-center mt-4 gap-2">
            <!-- Button to clear context -->
             <UButton v-if="previousTitle" size="xs" color="amber" variant="soft" :disabled="loading" @click="clearContext"
               v-tooltip="'Start a new topic (clears medication context)'">
               <template #leading>
                 <UIcon name="i-lucide-eraser"/>
               </template>
               Clear Context ({{ previousTitle }})
             </UButton>
            <div class="flex justify-end gap-2">
              <UButton v-if="query.trim()" color="gray" variant="soft" :disabled="loading" @click="query = ''">
                Clear Input
              </UButton>
              <UButton color="primary" :loading="loading" :disabled="!query.trim() || loading" @click="askMedication">
                <template #leading>
                  <UIcon name="i-lucide-search" />
                </template>
                {{ previousTitle ? 'Ask Follow-up' : 'Get Answer' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Loading Indicator -->
    <div v-if="loading" class="mt-6">
      <UCard>
        <div class="flex items-center justify-center p-4">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-gray-400" />
          <span class="ml-2 text-gray-500">{{ loadingMessage }}</span>
        </div>
      </UCard>
    </div>

    <!-- Response Display -->
    <div v-if="lastResponse && !loading" class="mt-6">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">Answer</h2>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">{{ lastResponse.metrics?.totalTimeMs }}ms</span>
              <UButton size="xs" color="gray" variant="ghost" icon="i-lucide-copy" @click="copyToClipboard"
                :loading="copying" v-tooltip="'Copy Answer'" />
            </div>
          </div>
        </template>

        <!-- Metrics Section -->
        <div class="metrics bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-4 text-sm border border-gray-200 dark:border-gray-700">
          <h3 class="font-medium mb-2 text-gray-700 dark:text-gray-300">API Call Details</h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
            <p><strong>Query:</strong></p>
            <p>{{ lastResponse.query || 'N/A' }}</p>
            <p><strong>Title Finding:</strong></p>
            <p>{{ lastResponse.metrics?.titleFindingTimeMs ?? 'N/A' }} ms</p>
            <p><strong>Context Prep:</strong></p>
            <p>{{ lastResponse.metrics?.contextPrepTimeMs ?? 'N/A' }} ms</p>
            <p><strong>Final Query:</strong></p>
            <p>{{ lastResponse.metrics?.finalQueryTimeMs ?? 'N/A' }} ms</p>
            <p><strong>Context Length:</strong></p>
            <p>{{ lastResponse.metrics?.contextLength ?? 'N/A' }} chars</p>
          </div>
        </div>

        <!-- Answer Content -->
        <div class="prose dark:prose-invert max-w-none">
          <MDC :value="lastResponse.data || ''" />
        </div>

         <!-- Debug Context -->
        <details class="mt-4">
          <summary class="text-xs text-gray-500 cursor-pointer">View Raw Context Used</summary>
          <pre class="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-40">{{ lastResponse.context || 'No context was used.' }}</pre>
        </details>

      </UCard>
    </div>

    <!-- Error Display -->
    <div v-if="error && !loading" class="mt-6">
      <UAlert title="Error" color="red" variant="soft" icon="i-lucide-alert-circle">
        {{ error }}
      </UAlert>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { UseToastReturn } from '#imports' // Ensure correct type import

// Define the expected structure of the API response

// Define the response format options
const responseFormat = ref('markdown')
const responseFormatOptions = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'text', label: 'Plain Text' }
]

interface MedicationApiResponse {
  success: boolean;
  data: string;
  query: string;
  context: string | null;
  matchedTitle: string | null;
  metrics: {
    totalTimeMs: number;
    titleFindingTimeMs: number;
    contextPrepTimeMs: number;
    finalQueryTimeMs: number;
    contextLength: number;
  } | null;
  timestamp: string;
  error?: string;
}


// Explicitly type useToast if possible, otherwise use `any` as fallback
const toast: UseToastReturn = useToast()

/* Commenting out auth middleware to make page public
definePageMeta({
  middleware: ['auth']
})
*/

interface HistoryItem {
  query: string;
  // Keep history simple for now, context/title managed separately
  // responseData: MedicationApiResponse; // Or just store text response?
  response: string; 
  timestamp: string;
}

const query = ref('')
// const response = ref('') // Replaced by lastResponse
const loading = ref(false)
const error = ref('')
const copying = ref(false)
const showHistory = ref(false)

// Store the full last API response object
const lastResponse = ref<MedicationApiResponse | null>(null)
// Store context and title for follow-up requests
const previousContext = ref<string | null>(null)
const previousTitle = ref<string | null>(null)
const previousQuery = ref<string | null>(null) // Store previous query for better follow-up handling

// Store query history in local storage
const queryHistory = ref<HistoryItem[]>([])

const loadingMessage = computed(() => {
  return previousTitle.value
    ? `Asking follow-up about ${previousTitle.value}...`
    : 'Searching medication information...'
});

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

// Simple query setter for sample questions
function setQuery(sample: string) {
  query.value = sample;
  // Clear context when clicking a sample question, as it implies a new topic
  clearContext(); 
}

function loadFromHistory(item: HistoryItem) {
  query.value = item.query
  // Reset context when loading from history, treat as new query
  clearContext();
  // Find the corresponding response object if needed, or just clear lastResponse
  lastResponse.value = null; // Clear previous display when loading history
}

function removeFromHistory(index: number) {
  queryHistory.value.splice(index, 1)
}

// Function to manually clear the conversation context
function clearContext() {
  previousContext.value = null;
  previousTitle.value = null;
  previousQuery.value = null; // Also clear previous query
  // Optionally clear the lastResponse display as well?
  // lastResponse.value = null;
  toast.add({
      title: 'Context Cleared',
      description: 'Ready for a new medication query.',
      color: 'info',
      icon: 'i-lucide-info',
      duration: 2000
    })
}

async function copyToClipboard() {
  if (!lastResponse.value?.data) return

  copying.value = true
  try {
    await navigator.clipboard.writeText(lastResponse.value.data)
    toast.add({
      title: 'Copied to clipboard',
      description: 'The response has been copied to your clipboard',
      color: 'success',
      icon: 'i-lucide-check',
      duration: 3000
    })
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    error.value = 'Failed to copy text.'; // Show error in UI
  } finally {
    copying.value = false
  }
}

async function askMedication() {
  if (!query.value.trim()) return

  loading.value = true
  error.value = ''
  // Don't clear lastResponse immediately, let it display until new data arrives or error occurs

  const requestBody: any = {
    query: query.value,
    format: responseFormat.value
  }

  // Add context if available (follow-up query)
  if (previousContext.value && previousTitle.value) {
    requestBody.previousContext = previousContext.value;
    requestBody.previousTitle = previousTitle.value;
    
    // Add previous query for better follow-up handling
    if (previousQuery.value) {
      requestBody.previousQuery = previousQuery.value;
      console.log('Sending follow-up with context for title:', previousTitle.value, 'and previous query:', previousQuery.value);
    } else {
      console.log('Sending follow-up with context for title:', previousTitle.value);
    }
  } else {
     console.log('Sending initial query:', query.value);
  }

  try {
    // Use $fetch with type hint for better DX
    const result = await $fetch<MedicationApiResponse>('/api/medication', {
      method: 'POST',
      body: requestBody
    })

    if (result.success) {
      lastResponse.value = result // Store the full response
      // Update context/title/query for the *next* potential follow-up
      previousContext.value = result.context
      previousTitle.value = result.matchedTitle
      previousQuery.value = query.value // Store current query as previous for next call
      console.log('Success. Storing context for next follow-up:', { title: previousTitle.value, contextLength: previousContext.value?.length, previousQuery: previousQuery.value })

      // Add to history (avoid duplicates based on query text)
      const isDuplicate = queryHistory.value.some(item => item.query === query.value)
      if (!isDuplicate) {
        queryHistory.value.unshift({
          query: query.value,
          response: result.data, // Store only text response in history for simplicity
          timestamp: new Date().toISOString()
        })

        // Limit history size
        if (queryHistory.value.length > 10) {
          queryHistory.value = queryHistory.value.slice(-10) // Keep the 10 most recent
        }
      }
      // Clear input field after successful submission?
      // query.value = '';
    } else {
      // Handle API-level errors (e.g., validation)
      error.value = result.error || 'Failed to get medication information'
      lastResponse.value = null; // Clear display on error
      // Consider clearing context on API error?
      // clearContext();
    }
  } catch (err: any) {
    // Handle network errors or other exceptions
    console.error('Error fetching medication information:', err)
    error.value = err.message || 'An error occurred while processing your request'
    lastResponse.value = null; // Clear display on error
    // Consider clearing context on network error?
    // clearContext();

    toast.add({
      title: 'Fetch Error',
      description: err.message || 'Could not reach the API. Please try again later.',
      color: 'danger',
      icon: 'i-lucide-alert-circle',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}
</script>
