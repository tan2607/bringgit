<template>
  <USlideover 
    v-model="slideover.isOpen"
    :title="t('instructions')"
    :ui="{ footer: 'justify-end', content: 'md:max-w-7xl' }"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-xl font-semibold">{{ t('assistant-prompt') }}</h3>
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
            {{ t('edit') }}
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
          <UInput
            icon="i-lucide-sparkles"
            v-model="changeInstructions"
            class="w-full mt-4"
            placeholder="Enter instructions for how to make changes to the prompt"
            :disabled="loading"
            :ui="{ trailing: 'pe-1' }"
          >
            <template v-if="changeInstructions?.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="Clear input"
                @click="changeInstructions = ''"
              />
            </template>
          </UInput>
          <UButton
            v-if="changeInstructions"
            color="primary"
            variant="soft"
            class="mt-2"
            icon="i-lucide-wand-2"
            :loading="loading"
            @click="applyChanges"
          >
            {{ t('apply-changes') }}
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
          {{ t('cancel') }}
        </UButton>
        <UButton
          v-if="!isEditing"
          color="neutral"
          variant="soft"
          @click="close"
        >
          {{ t('close') }}
        </UButton>
        <UButton
          v-if="isEditing"
          color="primary"
          :loading="loading"
          :disabled="!hasChanges"
          @click="saveChanges"
        >
          {{ t('save') }}
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
      title: t('success'),
      description: t('prompt-enhanced'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('error'),
      description: error.message || t('enhancement-failed'),
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
      title: t('success'),
      description: t('assistant-updated'),
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: t('error'),
      description: error.message || t('error-saving-changes'),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
