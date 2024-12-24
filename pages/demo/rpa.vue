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
                <UFormField label="Target URL" required>
                  <UInput
                    v-model="formState.url"
                    placeholder="Enter the webpage URL (e.g., https://example.com)"
                  />
                </UFormField>
                <UFormField label="Task Description" required>
                  <UTextarea
                    class="w-full"
                    v-model="formState.taskDescription"
                    placeholder="Enter each task step on a new line. For example:&#10;1. Click the login button&#10;2. Enter username in the form&#10;3. Click submit"
                    autoresize
                    :rows="4"
                  />
                </UFormField>
                <UFormField label="Task Parameters">
                  <UTextarea
                    class="w-full"
                    v-model="formState.taskParameters"
                    placeholder="Provide any required parameters in JSON format. For example: { 'name': 'John Doe', 'email': 'john@example.com' }"
                    autoresize
                    :rows="4"
                  />
                </UFormField>
                <div class="flex justify-end">
                  <UButton type="submit" :loading="isProcessing" :disabled="isProcessing">
                    Execute Task
                  </UButton>
                </div>
              </UForm>
            </UCard>

            <UAlert
              v-if="error"
              color="red"
              variant="soft"
              icon="i-heroicons-exclamation-triangle"
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
  taskParameters: '{}',
  url: ''
})

const isProcessing = ref(false)
const error = ref('')
const markdownContent = ref('')
const debugUrl = ref('')

// Handle incoming task parameters from OCR page
onMounted(() => {
  const { taskParameters } = route.query
  if (taskParameters) {
    try {
      // Validate that it's proper JSON before setting
      JSON.parse(taskParameters as string)
      formState.taskParameters = taskParameters as string
      // formState.taskDescription = ''
    } catch (e) {
      error.value = 'Invalid task parameters received'
    }
  }
})

const steps = [
  {
    id: 'input',
    title: 'Input',
    description: 'Provide task details'
  },
  {
    id: 'process',
    title: 'Process',
    description: 'Execute the task'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'View task results'
  }
]

async function handleSubmit() {
  try {
    error.value = ''
    isProcessing.value = true
    
    // Parse task parameters
    let parsedParams = {}
    try {
      parsedParams = JSON.parse(formState.taskParameters)
    } catch (e) {
      throw new Error('Invalid task parameters JSON format')
    }

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

    const response = await $fetch('/api/rpa/execute-task', {
      method: 'POST',
      body: {
        description: taskSteps,
        parameters: {
          ...parsedParams,
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
