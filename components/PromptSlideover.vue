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
            :maxrows="28"
            :autoresize="true"
            :loading="loading"
            :disabled="loading"
            class="font-mono text-sm w-full"
          />
          <div class="flex gap-2 mt-4 items-end">
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
      <div class="flex justify-end w-full items-center space-x-4">
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
</template>

<script setup lang="ts">
import WebsiteImportSlideover from './WebsiteImportSlideover.vue'

const { t } = useI18n()
const slideover = useSlideover()
const toast = useToast()

function openWebsiteImport() {
  slideover.open(WebsiteImportSlideover, {})
}

const props = defineProps<{
  assistant: any
}>()

const emit = defineEmits<{
  'assistant:updated': [assistant: any]
}>()

const loading = useState('promptSlideover.loading', () => false)
const editedPrompt = useState('promptSlideover.editedPrompt', () => '')
const changeInstructions = useState('promptSlideover.changeInstructions', () => '')
const isEditing = useState('promptSlideover.isEditing', () => false)

const hasChanges = computed(() => {
  const currentPrompt = props.assistant?.prompt?.trim() ?? ''
  const newPrompt = editedPrompt.value?.trim() ?? ''
  return currentPrompt !== newPrompt && newPrompt !== ''
})

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
  if (!hasChanges) return

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
    
    // Reset the state and close the slideover
    editedPrompt.value = ''
    isEditing.value = false
    close()
    
    toast.add({
      title: t('prompt.success'),
      description: t('prompt.prompt-updated'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('prompt.error'),
      description: error.message || t('prompt.update-failed'),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
