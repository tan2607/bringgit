<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <h2 class="text-2xl font-bold mb-8">Form Automation</h2>

    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-cpu-chip" class="text-primary" />
          <h3 class="font-medium">RPA Task Details</h3>
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
              />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Processing State -->
      <UCard v-if="isProcessing" color="primary" class="mt-4 p-4">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="animate-spin" />
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
      <UAlert
        v-if="rpaResults"
        color="green"
        variant="soft"
        icon="i-lucide-check-circle"
        :title="rpaResults"
        class="mt-4"
      />

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="soft"
            @click="resetForm"
          >
            Reset
          </UButton>
          <UButton
            color="primary"
            :loading="isSubmitting"
            :disabled="!canExecuteRpa"
            @click="executeRpaTask"
          >
            Execute Task
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  initialUrl?: string
  initialTaskDescription?: string
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', error: string): void
}>()

// Form state
const formState = useState('rpa.formState', () => ({
  url: props.initialUrl || '',
  taskDescription: props.initialTaskDescription || '',
  taskParameters: {} as Record<string, string>
}))

const extractedVariables = ref<string[]>([])
const rpaResults = ref('')
const error = ref('')
const isSubmitting = ref(false)
const isProcessing = ref(false)

const canExecuteRpa = computed(() => {
  if (!formState.value) return false
  return formState.value.url && formState.value.taskDescription && 
    extractedVariables.value.every(variable => 
      formState.value.taskParameters[variable]?.trim()
    )
})

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
  error.value = ''
  rpaResults.value = ''
  formState.value = {
    url: props.initialUrl || '',
    taskDescription: props.initialTaskDescription || '',
    taskParameters: {}
  }
  extractVariables()
}

async function executeRpaTask() {
  if (!canExecuteRpa.value) return

  isSubmitting.value = true
  isProcessing.value = true
  error.value = ''
  rpaResults.value = ''

  try {
    const taskSteps = formState.value.taskDescription
      .split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0)

    const response = await fetch('/api/rpa/execute-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: taskSteps,
        parameters: {
          url: formState.value.url,
          ...formState.value.taskParameters
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to execute RPA task')
    }

    const result = await response.json()
    if (result.error) {
      throw new Error(result.error)
    }

    rpaResults.value = 'Task completed successfully!'
    emit('success')
  } catch (e: any) {
    const errorMessage = e.message || 'An error occurred while executing the task'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    isSubmitting.value = false
    isProcessing.value = false
  }
}

// Initialize form when component mounts
onMounted(() => {
  extractVariables()
})
</script>
