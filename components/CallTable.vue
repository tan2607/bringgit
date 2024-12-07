<template>
  <div>
    <div class="flex items-center justify-between px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
      <USelectMenu
        v-model="selectedAssistant"
        :items="uniqueAssistants"
        :placeholder="t('table.filterAssistant')"
        class="w-64"
        clearable
        @update:model-value="table?.tableApi?.getColumn('assistant')?.setFilterValue($event || '')"
      />
      <UDropdownMenu
        :items="table?.tableApi
          ?.getAllColumns()
          .filter((column) => ['duration', 'status'].includes(column.id))
          .map((column) => ({
            label: upperFirst(column.id),
            type: 'checkbox' as const,
            checked: column.getIsVisible(),
            onUpdateChecked(checked: boolean) {
              table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
            },
            onSelect(e?: Event) {
              e?.preventDefault()
            }
          }))"
        :content="{ align: 'end' }"
      >
        <UButton
          label="Columns"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
        />
      </UDropdownMenu>
    </div>
    <UTable 
      ref="table"
      v-model:column-visibility="columnVisibility"
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
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo, useClipboard } from '@vueuse/core'
import { useCalls } from '@/composables/useCalls'
import TranscriptSlideover from '@/components/TranscriptSlideover.vue'
import { upperFirst } from 'scule'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const USelectMenu = resolveComponent('USelectMenu')
const toast = useToast();

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

const { copy } = useClipboard()

const table = useTemplateRef('table')

const columnVisibility = ref({
  duration: true,
  status: true,
  id: true
})

const uniqueAssistants = computed(() => {
  const assistants = new Set(props.data?.map(call => call.assistant) || [])
  return Array.from(assistants).sort()
})

const selectedAssistant = ref('')

const transformRecordingUrl = (originalUrl: string) => {
  if (!originalUrl) return ''
  const host = window.location.host
  const protocol = window.location.protocol
  const path = originalUrl.replace('https://storage.vapi.ai/', '')
  return `${protocol}//${host}/api/recording/${path}`
}

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
        const proxyUrl = transformRecordingUrl(row.getValue('recordingUrl'))
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            icon: isPlaying.value ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
            size: 'sm',
            color: isPlaying.value ? 'error' : 'primary',
            variant: isPlaying.value ? 'solid' : 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => togglePlayAudio(proxyUrl, row.getValue('id'))
          }),
          h(UButton, {
            icon: 'i-lucide-share-2',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              copy(proxyUrl)
              toast.add({
                title: 'URL Copied',
                duration: 1500,
                description: 'File URL copied to clipboard!',
                color: 'success', // or another appropriate color
                icon: 'i-lucide-check' // optional icon
              })
            }
          }),
          h(UButton, {
            icon: 'i-lucide-download',
            size: 'sm',
            color: 'primary',
            variant: 'ghost',
            class: 'hover:scale-110 transition-transform',
            onClick: () => {
              const link = document.createElement('a')
              link.href = proxyUrl
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
      accessorKey: "id",
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
              const id = row.getValue('id');
              const call = props.data.find(call => call.id === id)
              selectedCall.value = call
              const slideover = useSlideover()
              slideover.open(TranscriptSlideover, { 
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