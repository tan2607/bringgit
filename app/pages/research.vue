<template>
  <UContainer class="py-8 w-1/2">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-cpu" class="text-primary" />
          <h3 class="font-medium">Deep Company Research</h3>
        </div>
      </template>

      <UForm :state="formState" @submit="handleSubmit">
        <UFormField name="companyName" label="Company Name" required>
          <UInput v-model="formState.companyName" class="w-full" placeholder="Enter company name..." />
        </UFormField>
        
        <UFormField name="website" label="Website" hint="Optional">
          <UInput v-model="formState.website" class="w-full" placeholder="Enter company website..." />
        </UFormField>

        <UButton type="submit" :loading="isLoading" class="mt-4">
          Start Research
        </UButton>
      </UForm>

      <div v-if="isLoading" class="mt-8">
        <div class="flex items-center gap-4 mb-4">
          <UIcon name="i-heroicons-cog-6-tooth" class="animate-spin" />
          <span>Researching company information...</span>
        </div>
        <UProgress class="mt-2" :value="progressValue" />
      </div>

      <div v-if="error" class="mt-8 p-4 bg-red-50 text-red-600 rounded-md">
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-alert-triangle" />
          <span class="font-medium">Error</span>
        </div>
        <p>{{ error }}</p>
      </div>

      <div v-if="report || thinking" class="mt-8 space-y-4">
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
            class="text-sm bg-gray-50 rounded-lg p-4 whitespace-pre-wrap"
          >
            <MDC :value="thinking" />
          </div>
        </div>

        <div v-if="report" class="space-y-2">
          <div class="font-medium">Research Results</div>
          <MDC :value="report" />

          <UButton class="mt-4" color="primary" @click="saveNewAssistant">Save as New Assistant</UButton>
        </div>
      </div>
    </UCard>
    <CallTask v-if="report" :assistant-id="VAPI_ASSISTANT_ID" :variables="variables" />
  </UContainer>
</template>

<script setup lang="ts">
const formState = ref({
  companyName: '',
  website: ''
})
const report = ref('')
const thinking = ref('')
const showThinking = ref(false)
const isLoading = ref(false)
const progressValue = ref(0)
const error = ref('')

const VAPI_ASSISTANT_ID = 'f38d7101-518e-4856-9d8b-bb347b165115';
// Computed property for clean report without thinking content
const cleanReport = computed(() => report.value)

// Variables for the CallTask component
const variables = computed(() => ({
  companyName: formState.value.companyName,
  website: formState.value.website,
  research: cleanReport.value,
}))

let progressInterval: NodeJS.Timeout | null = null

const startFakeProgress = () => {
  progressValue.value = 0
  progressInterval = setInterval(() => {
    if (progressValue.value < 90) {
      progressValue.value += Math.random() * 15
    }
  }, 1000)
}

const stopFakeProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  progressValue.value = 100
}

const handleSubmit = async () => {
  if (!formState.value.companyName) return

  isLoading.value = true
  report.value = ''
  error.value = ''
  startFakeProgress()

  try {
    const { data, error: fetchError } = await useFetch('/api/research/company', {
      method: 'POST',
      body: {
        company: formState.value.companyName,
        website: formState.value.website
      }
    })

    if (fetchError.value) {
      throw new Error(fetchError.value.message || 'Failed to research company')
    }

    if (data.value) {
      parseResearchReport(data.value.toString())
    }
  } catch (err) {
    console.error('Research failed:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    isLoading.value = false
    stopFakeProgress()
  }
}
function parseResearchReport(response: string) {
  let reportText = ''
  
  // First look for thinking sections
  const thinkingMatch = response.match(/<think>(.*?)<\/think>/s)
  if (thinkingMatch) {
    // Extract thinking content
    let thinkingText = thinkingMatch[1]?.trim() || ''
    // Remove any HTML tags from thinking text
    thinkingText = thinkingText.replace(/<[^>]*>/g, '').trim()
    thinking.value = thinkingText

    // Use any text outside of think tags as the report
    reportText = response.replace(/<think>.*?<\/think>/s, '').trim()
  } else {
    reportText = response.trim();
  }

  // Remove citation marks in the report text eg. [4]
  reportText = reportText.replace(/\[\d+\]/g, '').trim()

  report.value = reportText
}

const saveNewAssistant = async () => {
  const { data: { value }  } = await useFetch('/api/assistants/' + VAPI_ASSISTANT_ID);
  const assistant = value as Assistant;

  console.log(assistant)
  console.log(assistant.model.messages[0].content)

  assistant.firstMessage = assistant.firstMessage.replace('{{companyName}}', variables.value.companyName)
  assistant.model.messages[0].content = assistant.model.messages[0].content.replace('{{research}}', variables.value.research)
  
  const { data } = await useFetch('/api/assistants/create', {
    method: 'POST',
    body: {
      ...assistant,
      name: `${variables.value.companyName}`,
      id: undefined
    }
  });

  // Open a new tab with the assistant
  window.open(`https://vai.keyreply.com/${variables.value.companyName}`, '_blank');

  return data
}

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
})
</script>
