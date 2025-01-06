<template>
  <USlideover
    :title="t('prompt.instructions')"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-xl font-semibold">{{ t('prompt.assistant-prompt') }}</h3>
      </div>
    </template>

    <template #body>
      <div class="h-full space-y-4">
        <div v-if="!isEditing" class="relative">
          <pre class="font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg min-h-[200px]">{{ props.assistant?.prompt }}</pre>
          <UButton
            class="absolute top-4 right-4"
            color="primary"
            variant="soft"
            icon="i-lucide-edit"
            @click="startEditing"
          >
            {{ t('prompt.edit') }}
          </UButton>
        </div>
        <div v-else>
          <UTextarea
            v-model="editedPrompt"
            :maxrows="30"
            :autoresize="true"
            :loading="loading"
            :disabled="loading"
            class="font-mono text-sm w-full"
          />
          <div class="flex gap-2 mt-4">
            <UInput
              icon="i-lucide-sparkles"
              v-model="changeInstructions"
              class="flex-1"
              :placeholder="t('prompt.enhancement-instructions-placeholder')"
              :disabled="loading"
              :ui="{ trailing: 'pe-1' }"
            >
              <template v-if="changeInstructions?.length" #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-circle-x"
                  :aria-label="t('prompt.clear-input')"
                  @click="changeInstructions = ''"
                />
              </template>
            </UInput>
            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide-globe"
              :loading="loading"
              @click="openWebsiteImport"
            >
              {{ t('prompt.import-website') }}
            </UButton>
          </div>
          <UButton
            v-if="changeInstructions"
            color="primary"
            variant="soft"
            class="mt-2"
            icon="i-lucide-wand-2"
            :loading="loading"
            @click="applyChanges"
          >
            {{ t('prompt.apply-changes') }}
          </UButton>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end items-center space-x-4">
        <UButton
          v-if="isEditing"
          color="neutral"
          variant="soft"
          @click="cancelEditing"
        >
          {{ t('prompt.cancel') }}
        </UButton>
        <UButton
          v-if="!isEditing"
          color="neutral"
          variant="soft"
          @click="close"
        >
          {{ t('prompt.close') }}
        </UButton>
        <UButton
          v-if="isEditing"
          color="primary"
          :loading="loading"
          :disabled="!hasChanges"
          @click="saveChanges"
        >
          {{ t('prompt.save') }}
        </UButton>
      </div>
    </template>
  </USlideover>

  <!-- Website Import Slideover -->
  <USlideover
    v-model="showWebsiteImport"
    :title="t('prompt.import-website')"
  >
    <template #body>
      <div class="space-y-4">
        <UInput
          v-model="websiteUrl"
          icon="i-lucide-globe"
          :placeholder="t('prompt.enter-website-url')"
          :disabled="crawling"
        />
        <div v-if="crawledContent" class="mt-4">
          <h4 class="font-medium mb-2">{{ t('prompt.crawled-content') }}</h4>
          <UCard>
            <MDC :value="crawledContent" />
          </UCard>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end items-center space-x-4">
        <UButton
          color="neutral"
          variant="soft"
          @click="closeWebsiteImport"
          :disabled="crawling"
        >
          {{ t('prompt.cancel') }}
        </UButton>
        <UButton
          v-if="crawledContent"
          color="primary"
          @click="importContent"
          :disabled="crawling"
        >
          {{ t('prompt.import') }}
        </UButton>
        <UButton
          v-else
          color="primary"
          :loading="crawling"
          :disabled="!websiteUrl"
          @click="crawlWebsite"
        >
          {{ t('prompt.crawl') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const { t } = useI18n()
const slideover = useSlideover()
const toast = useToast()

const props = defineProps<{
  assistant: any
}>()

const emit = defineEmits<{
  'assistant:updated': [assistant: any]
}>()

const loading = ref(false)
const editedPrompt = ref('')
const changeInstructions = ref('')
const isEditing = ref(false)

// Website import state
const showWebsiteImport = ref(false)
const websiteUrl = ref('')
const crawledContent = ref('')
const crawling = ref(false)

const hasChanges = computed(() => {
  const currentPrompt = props.assistant?.prompt?.trim() ?? ''
  const newPrompt = editedPrompt.value?.trim() ?? ''
  return currentPrompt !== newPrompt && newPrompt !== ''
})

function openWebsiteImport() {
  showWebsiteImport.value = true
  websiteUrl.value = ''
  crawledContent.value = ''
}

function closeWebsiteImport() {
  showWebsiteImport.value = false
  websiteUrl.value = ''
  crawledContent.value = ''
}

async function crawlWebsite() {
  if (!websiteUrl.value) return

  crawling.value = true
  try {
    const { content } = await $fetch('/api/knowledge/crawl', {
      method: 'POST',
      body: {
        url: websiteUrl.value
      }
    })
    
    crawledContent.value = content
    toast.add({
      title: t('prompt.success'),
      description: t('prompt.website-crawled'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('prompt.error'),
      description: error.message || t('prompt.crawling-failed'),
      color: 'error'
    })
  } finally {
    crawling.value = false
  }
}

function importContent() {
  if (!crawledContent.value) return
  
  // Append the crawled content to the current prompt
  editedPrompt.value = editedPrompt.value.trim() + '\n\n' + 
    `# Knowledge from ${websiteUrl.value}\n` + 
    crawledContent.value.trim()
  
  // Close the import slideover
  closeWebsiteImport()
  
  toast.add({
    title: t('prompt.success'),
    description: t('prompt.content-imported'),
    color: 'success'
  })
}

async function applyChanges() {
  if (!changeInstructions.value) return

  loading.value = true
  try {
    const { prompt } = await $fetch('/api/prompts/update', {
      method: 'POST',
      body: {
        originalPrompt: editedPrompt.value || props.assistant?.prompt,
        instructions: changeInstructions.value
      }
    })
    
    editedPrompt.value = prompt
    changeInstructions.value = ''
    toast.add({
      title: t('prompt.success'),
      description: t('prompt.prompt-enhanced'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('prompt.error'),
      description: error.message || t('prompt.enhancement-failed'),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

function startEditing() {
  editedPrompt.value = props.assistant?.prompt
  isEditing.value = true
}

function cancelEditing() {
  editedPrompt.value = ''
  isEditing.value = false
}

function close() {
  slideover.close()
}

async function saveChanges() {
  if (!hasChanges.value) return

  loading.value = true
  try {
    // Update the assistant in Vapi
    const updatedAssistant = await $fetch('/api/assistants/update', {
      method: 'POST',
      body: {
        id: props.assistant.id,
        prompt: editedPrompt.value
      }
    })

    // Emit the updated assistant
    emit('assistant:updated', updatedAssistant)
    isEditing.value = false
    editedPrompt.value = ''
    slideover.close()
    
    toast.add({
      title: t('prompt.success'),
      description: t('prompt.assistant-updated'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('prompt.error'),
      description: error.message || t('prompt.error-saving-changes'),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
