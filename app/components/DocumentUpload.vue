<template>
  <div class="space-y-6">
    <label
      id="dropcontainer"
      for="file-input"
      :class="[
        'drop-container',
        { 'h-[600px] flex items-center justify-center': documentPreview }
      ]"
      @dragover.prevent
      @dragenter.prevent="(e: any) => {e.target.classList.add('drag-active')}"
      @dragleave.prevent="(e: any) => {e.target.classList.remove('drag-active')}"
      @drop.prevent="handleDrop"
    >
      <template v-if="!documentPreview">
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
          <img :src="documentPreview" alt="Preview" class="w-full h-auto object-contain rounded-lg shadow-lg" />
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
      color="red"
      variant="soft"
      icon="i-lucide-alert-triangle"
      :title="error"
    >
      <template v-if="validationErrors?.length">
        <div class="mt-2 space-y-1 text-sm">
          <div v-for="(error, idx) in validationErrors" :key="idx">
            {{ error.path.join('.') }}: {{ error.message }}
          </div>
        </div>
      </template>
    </UAlert>

    <div v-if="patientData && !isProcessing" class="space-y-4">
      <UCollapsible>
        <UButton>View Extracted Data</UButton>
        <template #content>
          <pre class="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto">
            {{ JSON.stringify(patientData, null, 2) }}
          </pre>
        </template>
      </UCollapsible>
      
      <!-- <FormKitSchema :schema="patientIntakeFormSchema" :value="patientData" /> -->

      <div class="flex justify-end space-x-2">
        <UButton
          color="gray"
          variant="soft"
          @click="resetForm"
        >
          Reset
        </UButton>
        <UButton
          color="primary"
          :loading="isProcessing"
          @click="handleContinue"
        >
          Continue to Next Step
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { patientIntakeFormSchema } from '@@/shared/forms/patientIntakeSchema'

const {
  documentFile,
  documentPreview,
  isProcessing,
  error,
  validationErrors,
  patientData,
  nextStep,
  completeStep
} = useWorkflowState()

const fileInput = ref<HTMLInputElement>()

function resetForm() {
  documentFile.value = null
  documentPreview.value = ''
  isProcessing.value = false
  error.value = ''
  validationErrors.value = []
  patientData.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files?.length) {
    await processFile(files[0])
  }
}

async function handleFileInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) {
    await processFile(files[0])
  }
}

async function processFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size exceeds 5MB limit'
    return
  }

  documentFile.value = file
  const reader = new FileReader()
  reader.onload = async (e) => {
    documentPreview.value = e.target?.result as string
    isProcessing.value = true
    error.value = ''
    validationErrors.value = []

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Send to OCR endpoint
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!result.success) {
        error.value = result.error
        if (result.details) {
          validationErrors.value = result.details
        }
        return
      }

      patientData.value = result.data
    } catch (err: any) {
      error.value = err.message || 'Failed to process document'
    } finally {
      isProcessing.value = false
    }
  }

  reader.readAsDataURL(file)
}

function handleContinue() {
  if (patientData.value) {
    completeStep(1) // Mark document upload step as complete
    nextStep() // Move to next step
  }
}
</script>

<style scoped>
.drop-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed #ccc;
  color: #444;
  cursor: pointer;
  transition: background .2s ease-in-out, border .2s ease-in-out;
}

.drop-container:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.3);
}

.drop-container:hover .drop-title {
  color: #222;
}

.drop-title {
  color: #444;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  transition: color .2s ease-in-out;
}

.drag-active {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.4);
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
