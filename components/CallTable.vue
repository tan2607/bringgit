<template>
  <UTable 
    :data="data" 
    :columns="columns"
    :loading="callsStore.isLoading"
  >
    <template #status-data="{ row }">
      <UBadge :color="row.status === 'ended' ? 'green' : 'blue'">
        {{ row.status }}
      </UBadge>
    </template>
    <template #loading-state>
      <div class="flex items-center justify-center h-32">
        <UIcon name="i-lucide-loader-2" class="animate-spin" />
      </div>
    </template>
  </UTable>
</template>

<script setup>
import { computed, resolveComponent, h } from 'vue'
import { formatTimeAgo } from '@vueuse/core'
import { useCallsStore } from '@/stores/calls'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const callsStore = useCallsStore()

const columns = computed(() => {
  const baseColumns = [
    {
      accessorKey: "assistant",
      header: "Assistant",
      cell: (row) => row.getValue("assistant")
    },
    {
      accessorKey: 'startedAt',
      header: 'Call received',
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
      header: "Recording",
      cell: (row) => {
      const isPlaying = computed(() => callsStore.currentPlayingId === row.getValue('id'))
      return h('div', { class: 'flex gap-2' }, [
        h(UButton, {
        icon: isPlaying.value ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
        size: 'sm',
        color: isPlaying.value ? 'error' : 'primary',
        variant: isPlaying.value ? 'solid' : 'ghost',
        class: 'hover:scale-110 transition-transform',
        onClick: () => callsStore.togglePlayAudio(row.getValue('recordingUrl'), row.getValue('id'))
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
      header: "Duration",
      cell: (row) => row.getValue("duration")
    },
  ]

  // Only add these columns if not in compact mode
  if (!props.compact) {
    baseColumns.unshift({
      accessorKey: "id",
      header: "#",
      cell: (row) => row.getValue("id").slice(0, 6)
    })

    baseColumns.push({
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        return h(UBadge, { class: 'capitalize', variant: 'subtle' }, () =>
          row.getValue('status')
        )
      }
    })

    baseColumns.push({
      accessorKey: 'id',
      header: 'Actions',
      cell: (row) => {
        return h('div', { class: 'flex gap-2' }, [
          h(UButton, {
            label: 'Call Transcript',
            color: 'neutral',
            variant: 'ghost',
            onClick: () => {
              const call = callsStore.calls.find(c => c.id === row.getValue("id"))
              callsStore.selectedCall = call
              callsStore.isModalOpen = true
            }
          })
        ])
      }
    })
  }

  return baseColumns
})
</script>