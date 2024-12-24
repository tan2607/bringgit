<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-document-text" class="text-primary" />
          <h3 class="text-xl font-semibold">Document Processor</h3>
        </div>
      </template>

      <UStepper ref="stepper" :items="steps" class="w-full">
        <!-- Upload Step -->
        <template #upload>
          <div class="space-y-6">
            <label
              id="dropcontainer"
              for="file-input"
              class="drop-container"
              @dragover.prevent
              @dragenter.prevent="(e: any) => {e.target.classList.add('drag-active')}"
              @dragleave.prevent="(e: any) => {e.target.classList.remove('drag-active')}"
              @drop.prevent="handleDrop"
            >
              <span class="drop-title">Drop document here</span>
              <span class="text-sm text-gray-500">or</span>
              <input
                id="file-input"
                ref="fileInput"
                type="file"
                accept=".pdf,image/*"
                @input="handleFileInput"
              />
              <div class="text-xs text-gray-400 mt-2">
                <div>Supported formats: PDF, Images (JPG, PNG)</div>
                <div>Max file size: 5MB</div>
              </div>
            </label>

            <UCard v-if="isProcessing" color="primary" class="p-4">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-cog-6-tooth" class="animate-spin" />
                  <span>Processing your document...</span>
                </div>
                <UProgress class="w-full" animation="carousel" indeterminate />
              </div>
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

        <!-- Review Step -->
        <template #review>
          <div class="space-y-6">
            <UCollapsible>
              <UButton>View Extracted Fields</UButton>
              <template #content>
                <pre>
                  {{ JSON.stringify(extractedFields, null, 2) }}
                </pre>
              </template>
            </UCollapsible>
            <FormKitSchema :schema="patientIntakeSchema" :value="extractedFields" />
          </div>
        </template>

        <!-- Process Step -->
        <template #process>
          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-4">
              <UCard v-for="(action, index) in suggestedActions" :key="index" class="p-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <div class="font-medium">{{ action.title }}</div>
                    <div class="text-sm text-gray-500">{{ action.description }}</div>
                  </div>
                  <UButton
                    :color="action.type"
                    :icon="action.icon"
                    @click="executeAction(action)"
                  >
                    {{ action.buttonText }}
                  </UButton>
                </div>
              </UCard>
            </div>
          </div>
        </template>
      </UStepper>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { patientIntakeSchema } from '~/shared/forms/patientIntakeSchema'

const stepper = ref(null)
const fileInput = ref(null)
const isProcessing = ref(false)
const error = ref('')
const extractedFields = ref({})

const steps = [
  {
    slot: 'upload',
    title: 'Upload Document',
    description: 'Upload a document to process',
    icon: 'i-heroicons-cloud-arrow-up'
  },
  {
    slot: 'review',
    title: 'Review Data',
    description: 'Review extracted information',
    icon: 'i-heroicons-document-text'
  },
  {
    slot: 'process',
    title: 'Process',
    description: 'Choose next actions',
    icon: 'i-heroicons-cog-6-tooth'
  }
]

const suggestedActions = ref([
  {
    title: 'Save to Database',
    description: 'Store the extracted information in the database',
    buttonText: 'Save',
    type: 'primary',
    icon: 'i-heroicons-cloud-arrow-up',
    action: 'save'
  },
  {
    title: 'Automate with RPA',
    description: 'Use RPA to automate tasks with the extracted data',
    buttonText: 'Automate',
    type: 'success',
    icon: 'i-heroicons-cpu-chip',
    action: 'rpa'
  }
])

function formatKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function resetForm() {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  error.value = ''
  extractedFields.value = {}
  stepper.value?.go(0)
}

function handleDrop(e: any) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  try {
    isProcessing.value = true
    error.value = ''

    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/ocr', {
      method: 'POST',
      body: formData
    })

    // if (!response.success) {
    //   throw new Error(response.error || 'Failed to process document')
    // }

    extractedFields.value = response;
    stepper.value?.next() // Progress to review step after successful processing
  } catch (e: any) {
    error.value = e.message
  } finally {
    isProcessing.value = false
  }
}

async function executeAction(action: any) {
  try {
    if (action.action === 'save') {
      const response = await $fetch('/api/ocr/save', {
        method: 'POST',
        body: {
          fields: extractedFields.value
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to save data')
      }

      useToast().add({
        title: 'Success',
        description: 'Data saved successfully',
        icon: 'i-heroicons-check-circle',
        color: 'green'
      })
      
      stepper.value?.next() // Progress to process step after saving
    } else if (action.action === 'rpa') {
      // Navigate to RPA page with extracted fields
      navigateTo({
        path: '/demo/rpa',
        query: {
          taskParameters: JSON.stringify(extractedFields.value)
        }
      })
    }
  } catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.message,
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }
}
</script>

<style scoped>
.drop-container {
  position: relative;
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed #e5e7eb;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.drop-container:hover {
  border-color: #6b7280;
  background: #f9fafb;
}

.drop-container.drag-active {
  border-color: #6b7280;
  background: #f9fafb;
}

.drop-title {
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  transition: color 0.2s ease-in-out;
}

input[type=file] {
  max-width: 100%;
  padding: 8px 12px;
  cursor: pointer;
}

input[type=file]::file-selector-button {
  margin-right: 12px;
  border: none;
  background: #00dc82;
  padding: 8px 16px;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

input[type=file]::file-selector-button:hover {
  background: #00b368;
}
</style>
