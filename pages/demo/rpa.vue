<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-cpu-chip" class="text-primary" />
          <h3 class="text-xl font-semibold">AI-RPA Task Executor</h3>
        </div>
      </template>

      <UStepper ref="stepper" :items="steps" class="w-full">
        <!-- Input Step -->
        <template #input>
          <div class="space-y-6">
            <UCard class="p-4">
              <UForm :state="formState" class="space-y-4" @submit="handleSubmit">
                <UFormGroup label="Task Details" required>
                  <UFormField label="Target URL" name="url">
                    <UInput
                      v-model="formState.url"
                      placeholder="Enter the webpage URL (e.g., https://example.com)"
                    />
                  </UFormField>
                  <UFormField label="Task Description" name="taskDescription">
                    <UTextarea
                      v-model="formState.taskDescription"
                      placeholder="Enter each task step on a new line. Use %variable% for dynamic values. For example:&#10;1. Click the login button&#10;2. Enter %username% in the username field&#10;3. Enter %password% in the password field&#10;4. Click submit"
                      :ui="{ 
                        base: 'relative w-full flex flex-col',
                        wrapper: 'relative',
                        input: 'relative block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:opacity-75 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:focus:ring-primary-400 dark:placeholder:text-gray-500',
                      }"
                      :rows="6"
                      @input="extractVariables"
                    />
                  </UFormField>
                </UFormGroup>

                <!-- Dynamic Parameters Form -->
                <UFormGroup v-if="extractedVariables.length > 0" label="Task Parameters" class="mt-6">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <UFormField 
                      v-for="variable in extractedVariables" 
                      :key="variable"
                      :label="variable"
                      :name="variable"
                    >
                      <UInput
                        v-model="formState.taskParameters[variable]"
                        :placeholder="'Enter value for ' + variable"
                      />
                    </UFormField>
                  </div>
                </UFormGroup>

                <div class="flex justify-end pt-4">
                  <UButton 
                    type="submit" 
                    :loading="isProcessing" 
                    :disabled="isProcessing"
                    color="primary"
                    size="lg"
                  >
                    Execute Task
                  </UButton>
                </div>
              </UForm>
            </UCard>

            <UAlert
              v-if="error"
              color="red"
              variant="soft"
              icon="i-lucide-alert-triangle"
              :title="error"
            />
          </div>
        </template>

        <!-- Process Step -->
        <template #process>
          <div class="space-y-6">
            <UCard v-if="isProcessing" color="primary" class="p-4">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-cog-6-tooth" class="animate-spin" />
                  <span>Executing task...</span>
                </div>
                <UProgress class="w-full" animation="carousel" indeterminate />
              </div>
            </UCard>
          </div>
        </template>

        <!-- Results Step -->
        <template #results>
          <div class="space-y-6">
            <UCard class="p-4">
              <MDC :value="markdownContent" />
            </UCard>
            <div v-if="debugUrl" class="flex justify-end">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-eye"
                :href="debugUrl"
                target="_blank"
              >
                View Debug Session
              </UButton>
            </div>
          </div>
        </template>
      </UStepper>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const stepper = ref(null)
const formState = reactive({
  taskDescription: '',
  taskParameters: {} as Record<string, string>,
  url: 'https://forms.office.com/r/ADdwWc7QaL'
})

const extractedVariables = ref<string[]>([])
const isProcessing = ref(false)
const error = ref('')
const markdownContent = ref('')
const debugUrl = ref('')

function extractVariables() {
  const matches = formState.taskDescription.match(/%([^%]+)%/g) || []
  const variables = matches.map(match => match.replace(/%/g, ''))
  extractedVariables.value = [...new Set(variables)]

  // Initialize or clean up taskParameters
  const newParams: Record<string, string> = {}
  extractedVariables.value.forEach(variable => {
    newParams[variable] = formState.taskParameters[variable] || ''
  })
  formState.taskParameters = newParams
}

// Handle incoming task parameters from OCR page
onMounted(() => {
  const { taskParameters } = route.query
  if (taskParameters) {
    try {
      const params = JSON.parse(taskParameters as string)
      Object.assign(formState.taskParameters, params)
    } catch (e) {
      error.value = 'Invalid task parameters received'
    }
  }
})

const steps = [
  {
    slot: 'input',
    title: 'Input',
    description: 'Provide task details',
    icon: 'i-lucide-edit'
  },
  {
    slot: 'process',
    title: 'Process',
    description: 'Execute the task',
    icon: 'i-lucide-settings-2'
  },
  {
    slot: 'results',
    title: 'Results',
    description: 'View task results',
    icon: 'i-lucide-check-circle'
  }
]

async function handleSubmit() {
  try {
    error.value = ''
    isProcessing.value = true

    // Validate URL
    if (!formState.url) {
      throw new Error('URL is required')
    }

    // Split task description into steps
    const taskSteps = formState.taskDescription
      .split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0)

    if (taskSteps.length === 0) {
      throw new Error('Task description must contain at least one step')
    }

    // Validate all required parameters are filled
    const missingParams = extractedVariables.value.filter(
      variable => !formState.taskParameters[variable]
    )
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`)
    }

    const response = await $fetch('/api/rpa/execute-task', {
      method: 'POST',
      body: {
        description: taskSteps,
        parameters: {
          ...formState.taskParameters,
          url: formState.url
        }
      }
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to execute task')
    }

    markdownContent.value = response.markdownContent
    debugUrl.value = response.debugUrl
    stepper.value?.next()
  } catch (e: any) {
    error.value = e.message
    stepper.value?.go(0)
  } finally {
    isProcessing.value = false
  }
}
</script>
