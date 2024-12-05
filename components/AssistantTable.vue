<template>
  <div>
    <UTable 
      :data="data" 
      :columns="columns"
      :loading="isLoading"
    >
      <template #loading-state>
        <div class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo, useClipboard } from '@vueuse/core'
import { useAssistants } from '@/composables/useAssistants'
import { useI18n } from 'vue-i18n'
import AssistantSlideover from './AssistantSlideover.vue'
import PromptSlideover from './PromptSlideover.vue'

const UButton = resolveComponent('UButton')
const UTooltip = resolveComponent('UTooltip')
const UIcon = resolveComponent('UIcon')
const UPopover = resolveComponent('UPopover')
const UInput = resolveComponent('UInput')
const { copy } = useClipboard()

interface TableData {
  id: string
  name: string
  firstMessage: string
  prompt: string
  model: {
    model: string
    provider: string
  }
  voice: {
    provider: string
    voiceId: string
  }
  createdAt: string
  instructions: string
}

const props = defineProps({
  data: {
    type: Array as PropType<TableData[]>,
    required: true
  }
})

const { isLoading } = useAssistants()
const { t } = useI18n()
const toast = useToast()

const slideover = useSlideover()

const openAssistantModal = (name: string) => {
  slideover.open(AssistantSlideover, {
    assistantName: name
  })
}

const openPromptModal = (id: string) => {
  slideover.open(PromptSlideover, {
    assistant: props.data.find((a: any) => a.id === id)
  })
}

const newAssistantName = ref('')
const selectedAssistant = ref<any>(null)

const deleteAssistant = async (id: string) => {
  try {
    await useFetch(`/api/assistants/${id}`, {
      method: 'DELETE'
    })
    
    // Remove the assistant from the data array
    const index = props.data.findIndex((a: any) => a.id === id)
    if (index !== -1) {
      props.data.splice(index, 1)
    }

    // Show success toast
    toast.add({
      title: t('success'),
      description: t('assistant-deleted'),
      color: 'green'
    })
  } catch (error: any) {
    console.error('Failed to delete assistant:', error)
    // Show error toast
    toast.add({
      title: t('error'),
      description: error.message || t('failed-to-delete-assistant'),
      color: 'red'
    })
  }
}

const duplicateAssistant = async (assistant: any) => {
  try {
    if (!newAssistantName.value) return
    
    const { data: newAssistant } = await useFetch('/api/assistants/create', {
      method: 'POST',
      body: {
        name: newAssistantName.value,
        firstMessage: assistant.firstMessage,
        model: assistant.model,
        prompt: assistant.prompt,
        voice: assistant.voice,
        firstMessageMode: assistant.firstMessageMode,
        hipaaEnabled: assistant.hipaaEnabled,
        clientMessages: assistant.clientMessages,
        serverMessages: assistant.serverMessages,
        silenceTimeoutSeconds: assistant.silenceTimeoutSeconds,
        maxDurationSeconds: assistant.maxDurationSeconds,
        backgroundSound: assistant.backgroundSound,
        backgroundDenoisingEnabled: assistant.backgroundDenoisingEnabled,
        modelOutputInMessagesEnabled: assistant.modelOutputInMessagesEnabled,
        transportConfigurations: assistant.transportConfigurations,
        voicemailDetection: assistant.voicemailDetection,
        voicemailMessage: assistant.voicemailMessage,
        endCallMessage: assistant.endCallMessage,
        endCallPhrases: assistant.endCallPhrases,
        metadata: assistant.metadata,
        artifactPlan: assistant.artifactPlan,
        messagePlan: assistant.messagePlan,
        startSpeakingPlan: assistant.startSpeakingPlan,
        stopSpeakingPlan: assistant.stopSpeakingPlan,
        monitorPlan: assistant.monitorPlan,
        credentialIds: assistant.credentialIds
      }
    })
    
    if (newAssistant) {
      // Add the new assistant to the data array
      props.data.push(newAssistant)
      // Reset the form
      newAssistantName.value = ''
      selectedAssistant.value = null

      // Show success toast
      toast.add({
        title: t('success'),
        description: t('assistant-duplicated'),
        color: 'green'
      })
    }
  } catch (error: any) {
    console.error('Failed to duplicate assistant:', error)
    // Show error toast
    toast.add({
      title: t('error'),
      description: error.message || t('failed-to-duplicate-assistant'),
      color: 'red'
    })
  }
}

const handleDuplicateClick = (assistant: any) => {
  selectedAssistant.value = assistant
  newAssistantName.value = `${assistant.name} (Copy)`
}

const columns = computed(() => [
  {
    accessorKey: "name",
    header: () => t('name'),
    cell: (row) => h('div', { class: 'flex justify-center gap-2' }, [
      h(UButton, {
        icon: 'i-lucide-phone',
        size: 'sm',
        color: 'primary',
        variant: 'soft',
        class: 'hover:scale-110 transition-transform',
        onClick: () => openAssistantModal(row.getValue('name'))
      }, () => t('call-assistant') + ' ' + row.getValue('name'))
    ])
  },
  {
    accessorKey: "id",
    header: () => t('actions'),
    cell: (row) => h('div', { class: 'flex justify-center gap-2' }, [
      // Edit Prompt Button
      h(UTooltip, {
        text: t('edit-prompt')
      }, () => h(UButton, {
        icon: 'i-lucide-book-open',
        size: 'sm',
        color: 'primary',
        variant: 'ghost',
        onClick: () => openPromptModal(row.getValue('id'))
      })),
      
      // Duplicate Button
      h(UPopover, {
        mode: 'click',
        openDelay: 0,
        closeDelay: 0,
        class: 'w-80'
      }, {
        default: () => h(UTooltip, {
          text: t('duplicate')
        }, () => h(UButton, {
          icon: 'i-lucide-copy',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => handleDuplicateClick(props.data.find((a: any) => a.id === row.getValue('id')))
        })),
        content: () => h('div', { class: 'p-4 space-y-4' }, [
          h('h3', { class: 'text-base font-medium' }, t('duplicate-assistant')),
          h(UInput, {
            modelValue: newAssistantName.value,
            'onUpdate:modelValue': (val: string) => newAssistantName.value = val,
            placeholder: t('enter-assistant-name'),
            class: 'w-full'
          }),
          h('div', { class: 'flex justify-end gap-2' }, [
            h(UButton, {
              size: 'sm',
              color: 'primary',
              onClick: () => {
                if (selectedAssistant.value) {
                  duplicateAssistant(selectedAssistant.value)
                }
              }
            }, () => t('create'))
          ])
        ])
      }),

      // Delete Button
      h(UPopover, {
        mode: 'click',
        openDelay: 0,
        closeDelay: 0
      }, {
        default: () => h(UTooltip, {
          text: t('delete')
        }, () => h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'red',
          variant: 'ghost',
        })),
        content: () => h('div', { class: 'p-4 space-y-4' }, [
          h('h3', { class: 'text-base font-medium' }, t('delete-assistant')),
          h('p', { class: 'text-sm text-gray-500' }, t('delete-assistant-confirm')),
          h('div', { class: 'flex justify-end gap-2' }, [
            h(UButton, {
              size: 'sm',
              color: 'red',
              onClick: () => deleteAssistant(row.getValue('id'))
            }, () => t('delete'))
          ])
        ])
      })
    ])
  },
  {
    accessorKey: "model",
    header: () => t('model'),
    cell: (row) => {
      const model = row.getValue("model")
      return h('div', { class: 'flex justify-center' }, [
        h(UTooltip, {
          delayDuration: 0,
          content: {
            side: 'top'
          },
          text: `${model.provider} / ${model.model}`,
          arrow: true
        }, {
          default: () => h(UIcon, { 
            name: 'i-lucide-cpu',
            class: 'text-primary-500'
          })
        })
      ])
    }
  },
  {
    accessorKey: "voice",
    header: () => t('voice'),
    cell: (row: any) => {
      const voice = row.getValue("voice")
      const voiceId = voice.voiceId
      const toast = useToast()

      return h('div', { class: 'flex justify-center' }, [
        h(UTooltip, {
          delayDuration: 0,
          content: {
            side: 'top'
          },
          text: `${voice.provider} / ${voiceId}`,
          arrow: true
        }, {
          default: () => h(UIcon, { 
            name: 'i-lucide-mic',
            class: 'text-primary-500 cursor-pointer',
            onClick: () => {
              copy(voiceId)
              toast.add({
                title: 'Voice ID Copied',
                duration: 1500,
                description: 'Voice ID copied to clipboard!',
                color: 'success', // or another appropriate color
                icon: 'i-lucide-check' // optional icon
              })
            }
          })
        })
      ])
    }
  },
  {
    accessorKey: 'createdAt',
    header: () => t('created-at'),
    sortable: true,
    cell: (row: any) => {
      const time = new Date(row.getValue('createdAt'))
      const timeAgo = formatTimeAgo(time)
      return time.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ` (${timeAgo})`
    }
  }
])
</script>
