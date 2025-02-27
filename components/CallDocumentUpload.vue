<template>
  <div class="space-y-6">
    <div v-for="(fileType, index) in fileTypes" :key="index" class="space-y-4">
      <h4 class="font-medium">{{ fileType.label }}</h4>
      <label
        :id="`dropcontainer-${fileType.id}`"
        :for="`file-input-${fileType.id}`"
        class="drop-container"
        :class="{
          'h-[200px] flex items-center justify-center object-contain': fileType.preview,
          'border-red-500': !fileType.file && showValidation && fileType.required
        }"
        @dragover.prevent
        @dragenter.prevent="(e) => e.target.classList.add('drag-active')"
        @dragleave.prevent="(e) => e.target.classList.remove('drag-active')"
        @drop.prevent="(e) => handleDrop(e, fileType.id)"
      >
        <template v-if="!fileType.preview">
          <span class="drop-title">Drop {{ fileType.label.toLowerCase() }} here</span>
          <span class="text-sm text-gray-500">or</span>
          <input
            :id="`file-input-${fileType.id}`"
            :ref="el => fileInputRefs[fileType.id] = el"
            type="file"
            accept=".pdf,image/*"
            @input="(e) => handleFileInput(e, fileType.id)"
          />
          <div class="text-xs text-gray-400 mt-2">
            <div>Supported formats: PDF, Images (JPG, PNG)</div>
            <div>Max file size: 5MB</div>
          </div>
        </template>
        <template v-else>
          <div class="relative w-full max-w-md object-contain">
            <div class="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
              <span class="text-sm truncate">{{ fileType.file?.name }}</span>
              <UButton color="gray" variant="ghost" icon="i-lucide-x" size="sm"
                @click.prevent="() => resetFileType(fileType.id)" />
            </div>
            <!-- <img v-if="fileType.preview" :src="fileType.preview" :alt="fileType.label" -->
              <!-- class="mt-2 h-[200px] object-contain rounded-lg shadow-lg" /> -->
          </div>
        </template>
      </label>
      <p v-if="!fileType.file && showValidation && fileType.required" class="text-sm text-red-500">
        {{ fileType.label }} is required
      </p>
    </div>

    <UCard v-if="isProcessing" color="primary" class="p-4">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-settings-2" class="animate-spin" />
          <span>Processing your documents...</span>
        </div>
        <UProgress class="w-full" animation="carousel" indeterminate />
      </div>
    </UCard>

    <UAlert v-if="error" color="error" variant="soft" icon="i-lucide-alert-triangle" :title="error" />

    <div class="flex justify-end space-x-2">
      <UButton color="gray" variant="soft" @click="resetAllFiles">Reset</UButton>
      <UButton color="primary" :loading="isProcessing" :disabled="!hasFiles" @click="processDocuments">
        Extract Variables
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  onComplete: {
    type: Function,
    default: () => {}
  }
})

const emit = defineEmits(['update:extractedVariables'])

// File configuration
const fileTypes = ref([
  {
    id: 'medicalRecord',
    label: 'Medical Record',
    file: null as File | null,
    preview: '',
    required: false
  },
  {
    id: 'insuranceCard',
    label: 'Insurance Card',
    file: null as File | null,
    preview: '',
    required: false
  }
])

// UI state
const fileInputRefs = ref<Record<string, HTMLInputElement | null>>({})
const isProcessing = ref(false)
const error = ref('')
const showValidation = ref(false)
const hasFiles = computed(() => fileTypes.value.some(ft => ft.file !== null))

// File handling methods
function resetAllFiles() {
  fileTypes.value.forEach(fileType => resetFileType(fileType.id))
  error.value = ''
  showValidation.value = false
}

function resetFileType(fileTypeId: string) {
  const fileType = fileTypes.value.find(ft => ft.id === fileTypeId)
  if (fileType) {
    fileType.file = null
    fileType.preview = ''
  }
  
  const fileInput = fileInputRefs.value[fileTypeId]
  if (fileInput) {
    fileInput.value = ''
  }
}

async function handleDrop(e: DragEvent, fileTypeId: string) {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files?.length) {
    await handleFile(files[0], fileTypeId)
  }
}

async function handleFileInput(e: Event, fileTypeId: string) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) {
    await handleFile(files[0], fileTypeId)
  }
}

async function handleFile(file: File, fileTypeId: string) {
  // Reset error
  error.value = ''
  
  // Validate file size (5MB max)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_FILE_SIZE) {
    error.value = `File ${file.name} exceeds 5MB limit`
    return
  }
  
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/bmp']
  if (!allowedTypes.includes(file.type)) {
    error.value = `Invalid file type: ${file.name}. Supported formats: PDF, JPEG, PNG, TIFF, BMP`
    return
  }
  
  // Update file reference
  const fileType = fileTypes.value.find(ft => ft.id === fileTypeId)
  if (fileType) {
    fileType.file = file
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (fileType && e.target?.result) {
          fileType.preview = e.target.result as string
        }
      }
      reader.readAsDataURL(file)
    } else {
      // For PDFs, just show a placeholder or icon
      fileType.preview = '/pdf-icon.png' // Replace with actual path to PDF icon
    }
  }
}

// Process documents with OCR
async function processDocuments() {
  if (!hasFiles.value) {
    showValidation.value = true
    return
  }
  
  try {
    isProcessing.value = true
    error.value = ''
    
    // Prepare form data for API call
    const formData = new FormData()
    
    fileTypes.value.forEach(fileType => {
      if (fileType.file) {
        formData.append(fileType.id, fileType.file)
      }
    })
    
    // Call API endpoint
    const { data: response } = await useFetch('/api/extractCallVariables', {
      method: 'POST',
      body: formData
    })
    
    if (response.value?.success) {
      // Emit extracted variables to parent component
      emit('update:extractedVariables', response.value.data)
      
      // Call onComplete callback
      props.onComplete(response.value.data)
    } else {
      error.value = response.value?.error || 'Failed to process documents'
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred while processing documents'
  } finally {
    isProcessing.value = false
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
  background: rgba(0, 140, 255, 0.05);
  border-color: rgba(0, 140, 255, 0.5);
}

.drop-container:hover .drop-title {
  color: #0086ff;
}

.drop-title {
  color: #444;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  transition: color .2s ease-in-out;
}

.drag-active {
  background: rgba(0, 140, 255, 0.1);
  border-color: rgba(0, 140, 255, 0.7);
}

input[type=file] {
  width: 350px;
  max-width: 100%;
  color: #444;
  padding: 5px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ccc;
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
