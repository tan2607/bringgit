<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <h2 class="text-2xl font-bold mb-8">RPA Task</h2>
    
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-cpu" class="text-primary" />
          <h3 class="font-medium">Task Details</h3>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Target URL" class="col-span-full">
          <UInput
            v-model="formState.url"
            placeholder="Enter the webpage URL (e.g., https://example.com)"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Task Steps" class="col-span-full">
          <UTextarea
            v-model="formState.taskDescription"
            :rows="8"
            class="w-full font-mono text-sm"
            :ui="{ 
              base: 'relative w-full flex flex-col',
              wrapper: 'relative',
              input: 'relative block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:opacity-75 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:focus:ring-primary-400 dark:placeholder:text-gray-500 font-mono',
            }"
            @input="extractVariables"
          />
        </UFormField>

        <!-- Task Parameters -->
        <div v-if="extractedVariables.length > 0" class="mt-4">
          <h4 class="font-medium mb-2">Task Parameters</h4>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField 
              v-for="variable in extractedVariables" 
              :key="variable"
              :label="variable"
            >
              <UInput
                v-model="formState.taskParameters[variable]"
                :placeholder="'Enter value for ' + variable"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Browser Window -->
      <div v-if="sessionState.sessionUrl" class="mt-6">
        <UCard class="overflow-hidden">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-monitor" class="text-primary" />
                <h4 class="font-medium">Browser Window</h4>
              </div>
              <div class="flex items-center gap-2">
                <UBadge
                  v-if="sessionState.sessionId"
                  color="primary"
                  variant="soft"
                  size="sm"
                >
                  Session: {{ sessionState.sessionId }}
                </UBadge>
                <UButton
                  v-if="sessionState.debugUrl"
                  size="xs"
                  color="gray"
                  variant="ghost"
                  :icon="isFullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
                  @click="toggleFullscreen"
                />
              </div>
            </div>
          </template>
          
          <div :class="['relative', { 'h-[600px]': !isFullscreen, 'h-screen': isFullscreen }]">
            <iframe
              :src="sessionState.sessionUrl"
              class="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts"
              allow="clipboard-read; clipboard-write"
              style="pointer-events: none;"
            />
          </div>
        </UCard>
      </div>

      <!-- Actions List -->
      <div v-if="sessionState.actions?.length" class="mt-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-list-checks" class="text-primary" />
              <h4 class="font-medium">Observed Actions</h4>
            </div>
          </template>
          
          <ul class="divide-y">
            <li 
              v-for="(action, index) in sessionState.actions" 
              :key="index"
              class="py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-start gap-3">
                <UBadge size="sm" color="primary">{{ index + 1 }}</UBadge>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ action.type }}</p>
                  <p class="text-xs text-gray-500">{{ action.description }}</p>
                </div>
              </div>
            </li>
          </ul>
        </UCard>
      </div>

      <!-- Processing State -->
      <UCard v-if="isProcessing" color="primary" class="mt-4 p-4">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-settings-2" class="animate-spin" />
            <span>Executing task...</span>
          </div>
          <UProgress class="w-full" animation="carousel" indeterminate />
        </div>
      </UCard>

      <!-- Error State -->
      <UAlert
        v-if="error"
        color="red"
        variant="soft"
        icon="i-lucide-alert-triangle"
        :title="error"
        class="mt-4"
      />

      <!-- Results -->
      <div v-if="rpaResults" class="mt-4 space-y-4">
        <UCollapsible>
          <UButton>View Task Results</UButton>
          <template #content>
            <div class="mt-2">
              <MDC :value="rpaResults" />
            </div>
          </template>
        </UCollapsible>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            v-if="rpaResults"
            color="gray"
            variant="soft"
            @click="resetForm"
          >
            Try Again
          </UButton>
          <UButton
            color="primary"
            :loading="isSubmitting"
            :disabled="!canExecute"
            @click="executeTask"
          >
            Execute Task
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  initialUrl?: string
  initialTaskDescription?: string
}>()

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

// Form state
const formState = ref({
  url: props.initialUrl || '',
  taskDescription: props.initialTaskDescription || '',
  taskParameters: {} as Record<string, string>
})

// Session state
const sessionState = ref({
  sessionId: '',
  sessionUrl: '',
  debugUrl: '',
  actions: [] as any[]
})

const extractedVariables = ref<string[]>([])
const rpaResults = ref('')
const error = ref('')
const isProcessing = ref(false)
const isSubmitting = ref(false)
const isFullscreen = ref(false)

// Computed
const canExecute = computed(() => {
  if (!formState.value) return false
  return formState.value.url && formState.value.taskDescription && 
    extractedVariables.value.every(variable => 
      formState.value.taskParameters[variable]?.trim()
    )
})

// Methods
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function extractVariables() {
  if (!formState.value.taskDescription) return
  const matches = formState.value.taskDescription.match(/%([^%]+)%/g) || []
  const variables = matches.map(match => match.replace(/%/g, ''))
  extractedVariables.value = [...new Set(variables)]

  // Initialize or clean up taskParameters
  const newParams: Record<string, string> = {}
  extractedVariables.value.forEach(variable => {
    newParams[variable] = formState.value.taskParameters[variable] || ''
  })
  formState.value.taskParameters = newParams
}

function resetForm() {
  formState.value = {
    url: props.initialUrl || '',
    taskDescription: props.initialTaskDescription || '',
    taskParameters: {}
  }
  sessionState.value = {
    sessionId: '',
    sessionUrl: '',
    debugUrl: '',
    actions: []
  }
  error.value = ''
  rpaResults.value = ''
  extractVariables()
}

async function executeTask() {
  if (!canExecute.value) return

  isSubmitting.value = true
  error.value = ''
  rpaResults.value = ''

  try {
    const taskSteps = formState.value.taskDescription
      .split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0)

    const response = await fetch('/api/rpa/execute-task', {
      method: 'POST',
      body: JSON.stringify({
        description: taskSteps,
        parameters: {
          url: formState.value.url,
          ...formState.value.taskParameters
        }
      })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to execute RPA task')
    }

    // Update session state
    if (result.data) {
      sessionState.value = {
        sessionId: result.data.sessionId,
        sessionUrl: result.data.sessionUrl,
        debugUrl: result.data.debugUrl,
        actions: result.data.actions || []
      }
    }

    if (result.markdownContent) {
      rpaResults.value = result.markdownContent
    }

    emit('success')
  } catch (err: any) {
    error.value = err.message
    emit('error', err.message)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize
watch(
  () => props.initialTaskDescription,
  () => {
    if (props.initialTaskDescription) {
      formState.value.taskDescription = props.initialTaskDescription
      extractVariables()
    }
  },
  { immediate: true }
)
</script>
