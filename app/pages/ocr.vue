<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="text-primary" />
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
              :class="[
                'drop-container',
                { 'h-[600px] flex items-center justify-center': imagePreview }
              ]"
              @dragover.prevent
              @dragenter.prevent="(e: any) => {e.target.classList.add('drag-active')}"
              @dragleave.prevent="(e: any) => {e.target.classList.remove('drag-active')}"
              @drop.prevent="handleDrop"
            >
              <template v-if="!imagePreview">
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
              </template>
              <template v-else>
                <div class="relative w-full max-w-md">
                  <img :src="imagePreview" alt="Preview" class="w-full h-auto object-contain rounded-lg shadow-lg" />
                  <UButton
                    class="absolute top-2 right-2"
                    color="gray"
                    variant="solid"
                    icon="i-lucide-x"
                    size="sm"
                    @click.prevent="resetForm"
                  />
                </div>
              </template>
            </label>

            <UCard v-if="isProcessing" color="primary" class="p-4">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-settings-2" class="animate-spin" />
                  <span>Processing your document...</span>
                </div>
                <UProgress class="w-full" animation="carousel" indeterminate />
              </div>
            </UCard>

            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              icon="i-lucide-alert-triangle"
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
            <!-- <FormKitSchema :schema="patientIntakeFormSchema" :value="extractedFields" /> -->
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
// import { patientIntakeFormSchema } from '@@/shared/forms/patientIntakeSchema'

const stepper = ref(null)
const fileInput = ref(null)
const isProcessing = ref(false)
const error = ref('')
const extractedFields = ref({})
const imagePreview = ref('')
const isImage = ref(false)

const steps = [
  {
    slot: 'upload',
    title: 'Upload Document',
    description: 'Upload a document to process',
    icon: 'i-lucide-upload-cloud'
  },
  {
    slot: 'review',
    title: 'Review Data',
    description: 'Review extracted information',
    icon: 'i-lucide-file-text'
  },
  {
    slot: 'process',
    title: 'Process',
    description: 'Choose next actions',
    icon: 'i-lucide-settings-2'
  }
]

const suggestedActions = ref([
  {
    title: 'Save to Database',
    description: 'Store the extracted information in the database',
    buttonText: 'Save',
    type: 'primary',
    icon: 'i-lucide-upload-cloud',
    action: 'save'
  },
  {
    title: 'Automate with RPA',
    description: 'Use RPA to automate tasks with the extracted data',
    buttonText: 'Automate',
    type: 'success',
    icon: 'i-lucide-cpu',
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
  imagePreview.value = ''
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
    isImage.value = file.type.startsWith('image/')
    
    if (isImage.value) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      imagePreview.value = ''
    }

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
        icon: 'i-lucide-check-circle',
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
      icon: 'i-lucide-x-circle',
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
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed #555;
  color: #444;
  cursor: pointer;
  transition: background .2s ease-in-out, border .2s ease-in-out;
  min-height: 200px;
}

.drop-container:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.3);
}

.drop-container.drag-active {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.4);
}

.drop-title {
  color: #444;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  transition: color .2s ease-in-out;
}

input[type=file] {
  width: 350px;
  max-width: 100%;
  color: #444;
  padding: 5px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #555;
}

input[type=file]::file-selector-button {
  margin-right: 20px;
  border: none;
  background: #084cdf;
  padding: 10px 20px;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: background .2s ease-in-out;
}

input[type=file]::file-selector-button:hover {
  background: #0d45a5;
}
</style>
