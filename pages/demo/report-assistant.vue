<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-table" class="text-primary" />
          <h3 class="text-xl font-semibold">Report Assistant</h3>
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
                { 'h-[600px] flex items-center justify-center': filePreview }
              ]"
              @dragover.prevent
              @dragenter.prevent="(e: any) => {e.target.classList.add('drag-active')}"
              @dragleave.prevent="(e: any) => {e.target.classList.remove('drag-active')}"
              @drop.prevent="handleDrop"
            >
              <template v-if="!filePreview">
                <span class="drop-title">Drop report file here</span>
                <span class="text-sm text-gray-500">or</span>
                <input
                  id="file-input"
                  ref="fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  @input="handleFileInput"
                />
                <div class="text-xs text-neutral-400 mt-2">
                  <div>Supported formats: CSV, Excel (XLSX, XLS)</div>
                  <div>Max file size: 5MB</div>
                </div>
                <div class="mt-4 text-sm text-neutral-500">
                  <span>Need a sample file?</span>
                  <UButton
                    variant="link"
                    color="primary"
                    size="xs"
                    :to="'/demo/vitalus-sales-report.csv'"
                    target="_blank"
                    download
                  >
                    Download sales report
                  </UButton>
                </div>
              </template>
              <template v-else>
                <div class="relative w-full max-w-md p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-file-spreadsheet" class="text-primary text-xl" />
                    <span class="font-medium">{{ fileName }}</span>
                  </div>
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
                  <span>Processing your file...</span>
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
            />
          </div>
        </template>

        <!-- Query Step -->
        <template #query>
          <div class="space-y-6">
            <div v-if="filePreview" class="space-y-4">
              <UCard>
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-table" class="text-primary" />
                    <span class="font-medium">Data Preview</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UBadge color="primary" variant="soft">
                      {{ totalRows }} rows
                    </UBadge>
                    <UBadge color="primary" variant="soft">
                      {{ headers.length }} columns
                    </UBadge>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th v-for="header in headers" :key="header" class="px-4 py-2 bg-neutral-100 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          {{ header }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-200">
                      <tr v-for="(row, index) in previewData" :key="index" :class="{ 'bg-neutral-50': index % 2 === 0 }">
                        <td v-for="header in headers" :key="header" class="px-4 py-2 text-sm text-neutral-700">
                          {{ row[header] }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="totalRows > previewData.length" class="mt-2 text-center text-sm text-neutral-500">
                  Showing first {{ previewData.length }} of {{ totalRows }} rows
                </div>
              </UCard>

              <div class="space-y-4">
                <UFormField label="Ask a question about your data">
                  <UTextarea
                    v-model="question"
                    :rows="3"
                    class="w-full"
                    placeholder="e.g., What is the total revenue from Sleep Services? Which location has the highest patient satisfaction?"
                  />
                  <template #help>
                    <div class="flex items-center gap-1 text-xs text-neutral-500">
                      <UIcon name="i-lucide-lightbulb" class="text-warning" />
                      <span>Try asking about revenue by category, patient satisfaction trends, or insurance type distribution</span>
                    </div>
                  </template>
                </UFormField>

                <div class="space-y-3">
                  <div class="text-xs text-neutral-500 font-medium">Example questions:</div>
                  <div class="flex flex-wrap gap-2">
                    <UButton
                      v-for="(exampleQ, index) in exampleQuestions"
                      :key="index"
                      size="xs"
                      variant="soft"
                      color="neutral"
                      class="text-xs"
                      @click="question = exampleQ"
                    >
                      {{ exampleQ }}
                    </UButton>
                  </div>
                </div>

                <div class="flex justify-center">
                  <UButton
                    :loading="isQuerying"
                    :disabled="!question || isQuerying"
                    @click="askQuestion"
                    icon="i-lucide-message-circle-question"
                  >
                    Ask Question
                  </UButton>
                </div>
              </div>

              <UCard 
                v-if="answer || thinking" 
                ref="answerCard"
                :color="error ? 'error' : 'primary'" 
                class="p-4"
              >
                <div class="space-y-4">
                  <div class="font-medium flex items-center gap-2">
                    <UIcon :name="error ? 'i-lucide-alert-triangle' : 'i-lucide-message-square-text'" />
                    <span>{{ error ? 'Error' : 'Answer' }}</span>
                  </div>

                  <div v-if="thinking" class="space-y-2">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      class="flex items-center gap-2 text-sm"
                      @click="showThinking = !showThinking"
                    >
                      <UIcon
                        :name="showThinking ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                        class="w-4 h-4"
                      />
                      <span class="font-medium">Reasoning Process</span>
                    </UButton>
                    
                    <div
                      v-if="showThinking"
                      class="text-sm bg-white bg-opacity-10 rounded-lg p-4 whitespace-pre-wrap"
                    >
                      {{ thinking }}
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="font-medium text-sm">Final Answer</div>
                    <MDC :value="answer" />
                  </div>
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
const config = useRuntimeConfig()
const stepper = ref()
const fileInput = ref<HTMLInputElement>()
const answerCard = ref<HTMLElement>()
const fileName = ref('')
const filePreview = ref(false)
const isProcessing = ref(false)
const isQuerying = ref(false)
const error = ref('')
const headers = ref<string[]>([])
const previewData = ref<any[]>([])
const totalRows = ref(0)
const question = ref('')
const answer = ref('')
const thinking = ref('')
const showThinking = ref(false)
const rawData = ref('')

const exampleQuestions = [
  "What's the revenue breakdown by product category?",
  "Which services have the highest patient satisfaction?",
  "What's the distribution of insurance types for Sleep Studies?",
  "Which location generates the most revenue from CPAP devices?",
  "What's the average patient satisfaction by category?",
  "Which products have sold more than 10 units?"
]

const steps = [
  {
    slot: 'upload',
    title: 'Upload File',
    description: 'Upload your report file',
    icon: 'i-lucide-upload'
  },
  {
    slot: 'query',
    title: 'Ask Questions',
    description: 'Ask questions about your data',
    icon: 'i-lucide-message-circle-question'
  }
]

function resetForm() {
  if (fileInput.value) fileInput.value.value = ''
  fileName.value = ''
  filePreview.value = false
  error.value = ''
  headers.value = []
  previewData.value = []
  question.value = ''
  answer.value = ''
  thinking.value = ''
  stepper.value?.setStep(0)
}

function handleDrop(e: DragEvent) {
  const dt = e.dataTransfer
  if (!dt?.files) return
  processFile(dt.files[0])
}

function handleFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  processFile(target.files[0])
}

async function processFile(file: File) {
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size exceeds 5MB limit'
    return
  }

  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Invalid file type. Please upload a CSV or Excel file.'
    return
  }

  isProcessing.value = true
  error.value = ''
  
  try {
    const text = await file.text()
    rawData.value = text
    
    // Parse CSV
    const rows = text.split('\n').map(row => row.split(','))
    headers.value = rows[0]
    const dataRows = rows.slice(1).filter(row => row.length === headers.value.length)
    
    totalRows.value = dataRows.length
    previewData.value = dataRows.slice(0, 10).map(row => {
      const obj: Record<string, string> = {}
      headers.value.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })
    
    fileName.value = file.name
    filePreview.value = true
    stepper.value?.next()
  } catch (err: any) {
    error.value = err.message || 'Failed to process file'
  } finally {
    isProcessing.value = false
  }
}

function parseAnswer(fullAnswer: string) {
  const thinkMatch = fullAnswer.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    thinking.value = thinkMatch[1].trim();
    answer.value = fullAnswer.replace(/<think>[\s\S]*?<\/think>/, '').trim();
  } else {
    thinking.value = '';
    answer.value = fullAnswer;
  }
}

async function askQuestion() {
  if (!question.value || !rawData.value) return
  
  isQuerying.value = true
  error.value = ''
  answer.value = ''
  thinking.value = ''
  showThinking.value = false
  
  try {
    const response = await $fetch('/api/csv/query', {
      method: 'POST',
      body: {
        question: question.value,
        data: rawData.value
      }
    })
    
    parseAnswer(response.answer)
    
    // Wait for the answer card to be rendered
    await nextTick()
    // Scroll the answer into view with smooth animation
    answerCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  } catch (err: any) {
    error.value = err.message || 'Failed to process question'
    answer.value = 'Sorry, there was an error processing your question. Please try again.'
  } finally {
    isQuerying.value = false
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
  border: 2px dashed var(--color-gray-300);
  color: var(--color-gray-700);
  cursor: pointer;
  transition: background .2s ease-in-out, border .2s ease-in-out;
}

.drop-container:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.drop-container.drag-active {
  background: var(--color-gray-100);
  border-color: var(--color-gray-500);
}

.drop-container input[type=file] {
  width: 350px;
  max-width: 100%;
  color: var(--color-gray-700);
  padding: 2px;
  background: white;
  border-radius: 10px;
  border: 1px solid var(--color-gray-200);
}

.drop-container input[type=file]::file-selector-button {
  margin-right: 20px;
  border: none;
  background: var(--color-primary);
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  cursor: pointer;
}

.drop-container input[type=file]::file-selector-button:hover {
  background: var(--color-primary-400);
}

.drop-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  transition: color .2s ease-in-out;
}
</style>
