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

function handleAssistantUpdated(updatedAssistant: any) {
  // Update the assistant in the table data
  const index = props.data.findIndex((a: any) => a.id === updatedAssistant.id)
  if (index !== -1) {
    props.data[index] = updatedAssistant
  }
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
    header: () => t('instructions'),
    cell: (row) => h('div', { class: 'flex justify-center' }, [
      h(UButton, {
        icon: 'i-lucide-book-open',
        size: 'sm',
        color: 'primary',
        variant: 'ghost',
        class: 'hover:scale-110 transition-transform',
        onClick: () => openPromptModal(row.getValue())
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
