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
    <AssistantModal
      v-if="modal.isOpen"
      :assistant="selectedAssistant"
    />
    <PromptModal
      v-if="modal.isOpen"
      :assistant="selectedAssistant"
    />
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo, useClipboard } from '@vueuse/core'
import { useAssistants } from '@/composables/useAssistants'
import { useI18n } from 'vue-i18n'
import AssistantModal from './AssistantModal.vue'
import PromptModal from './PromptModal.vue'
import { ref, computed, resolveComponent } from 'vue'

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

const modal = useModal()

const openAssistantModal = (name: string) => {
  modal.open(AssistantModal, { 
    assistantName: name
  })
}

const openPromptModal = (prompt: string) => {
  modal.open(PromptModal, {
    prompt
  })
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
    accessorKey: "prompt",
    header: () => t('instructions'),
    cell: (row) => h('div', { class: 'flex justify-center' }, [
      h(UButton, {
        icon: 'i-lucide-book-open',
        size: 'sm',
        color: 'primary',
        variant: 'ghost',
        class: 'hover:scale-110 transition-transform',
        onClick: () => openPromptModal(row.getValue('prompt'))
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
    cell: (row) => {
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
    cell: (row) => {
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
