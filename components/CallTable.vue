<template>
  <div>
    <UTable 
      :data="data" 
      :columns="columns"
      :loading="isLoading"
    >
      <template #status-data="{ row }">
        <UBadge :color="row.status === 'ended' ? 'success' : 'info'">
          {{ row.status }}
        </UBadge>
      </template>
      <template #loading-state>
        <div class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>
      </template>
    </UTable>
    <TranscriptModal />
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { useCalls } from '@/composables/useCalls'
import TranscriptModal from '@/components/TranscriptModal.vue'
import { useI18n } from 'vue-i18n'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

interface TableData {
  id: string
  assistant: string
  startedAt: string
  recordingUrl: string
  duration: string
  summary?: string
  status: string
}

const props = defineProps({
  data: {
    type: Array as PropType<TableData[]>,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const { isLoading, currentPlayingId, togglePlayAudio, selectedCall } = useCalls()

const { t } = useI18n()

const columns = computed(() => {
  const baseColumns = [
    {
      accessorKey: "assistant",
      header: () => t('table.assistant'),
      cell: (row) => row.getValue("assistant")
    },
    {
      accessorKey: 'startedAt',
      header: () => t('table.callReceived'),
      sortable: true,
      cell: (row) => {
        const time = new Date(row.getValue('startedAt'));
        const timeAgo = formatTimeAgo(time)
        return time.toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }) + ` (${timeAgo})`
      }
    },
    {
      accessorKey: "recordingUrl",
      header: () => t('table.recording'),
      cell: (row) => {
        const isPlaying = computed(() => currentPlayingId.value === row.getValue('id'))
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            icon: isPlaying.value ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
            size: 'sm',
            color: isPlaying.value ? 'error' : 'primary',
            variant: isPlaying.value ? 'solid' : 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => togglePlayAudio(row.getValue('recordingUrl'), row.getValue('id'))
          }),
          h(UButton, {
            icon: 'i-lucide-download',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              const link = document.createElement('a')
              link.href = row.getValue('recordingUrl')
              link.download = `recording-${row.getValue('id')}.mp3`
              link.click()
            }
          })
        ])
      }
    },
    {
      accessorKey: "duration",
      header: () => t('table.duration'),
      cell: (row) => row.getValue("duration")
    },
  ]

  // Only add these columns if not in compact mode
  if (!props.compact) {
    baseColumns.unshift({
      accessorKey: "id",
      header: () => t('table.id'),
      cell: (row) => row.getValue("id").slice(0, 6)
    })

    baseColumns.push({
      accessorKey: "status",
      header: () => t('table.status'),
      cell: (row) => {
        return h(UBadge, { class: 'capitalize', variant: 'subtle' }, () =>
          row.getValue('status')
        )
      }
    })

    baseColumns.push({
      accessorKey: 'id',
      header: () => t('table.actions'),
      cell: (row) => {
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            icon: 'i-lucide-file-text',
            label: 'View Transcript',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            onClick: () => {
              const call = props.data.find(c => c.id === row.getValue("id"))
              selectedCall.value = call
              const modal = useModal()
              modal.open(TranscriptModal, { 
                call 
              })
            }
          })
        ])
      }
    })
  }

  return baseColumns
})
</script>