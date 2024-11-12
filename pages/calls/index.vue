<template>
  <div class="call-list-page p-4">
    <h1 class="text-2xl font-bold mb-4">Call List</h1>
    
    <!-- Filters -->
    <div class="filters flex gap-4 mb-4">
      <div class="flex gap-2">
        <UInput type="date" v-model="startDate" />
        <UInput type="date" v-model="endDate" />
      </div>
    
      <USelect 
        v-model="callStatus"
        :items="[
          { label: 'Queued', value: 'queued' },
          { label: 'Ended', value: 'ended' }
        ]"
      />
    </div>
    <UTable 
      :data="filteredCalls" 
      :columns="columns"
    >
      <template #status-data="{ row }">
        <UBadge :color="row.status === 'ended' ? 'green' : 'blue'">
          {{ row.status }}
        </UBadge>
      </template>
    </UTable>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen" title="Call Summary" :description="selectedCall?.summary">
      <template #body>
        <div>
          <h4 class="font-medium mb-2">Transcript</h4>
            <UTextarea v-model="selectedCall.transcript" autoresize :maxrows="10" disabled highlight class="w-full"></UTextarea>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, resolveComponent, h, onBeforeUnmount } from 'vue';
import { formatTimeAgo } from '@vueuse/core'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const isModalOpen = ref(false)
const selectedCall = ref(null)

// Add this before columns definition
const currentPlayingAudio = ref(null)
const currentPlayingId = ref(null)

// Define columns for the call data
const columns = [
  {
    accessorKey: "id",
    header: "#",
    cell: (row) => row.getValue("id").slice(0, 6)
  },
  {
    accessorKey: 'startedAt',
    header: 'Call received',
    sortable: true,
    cell: (row) => {
      const time = new Date(row.getValue('startedAt'));
      const timeAgo = formatTimeAgo(time) // string

      return time.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ` (${timeAgo})`
    }
  },

  // {
  //   accessorKey: 'endedAt',
  //   header: 'Ended on',
  //   sortable: true,
  //   cell: (row) =>  {
  //     const time = new Date(row.getValue('startedAt'));
  //     const timeAgo = formatTimeAgo(time) // string

  //     return time.toLocaleString('en-US', {
  //       day: 'numeric',
  //       month: 'short',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: false
  //     }) + ` (${timeAgo})`}
  // },

  {
    accessorKey: "recordingUrl",
    header: "Playback",
    cell: (row) => {
      const isPlaying = computed(() => currentPlayingId.value === row.getValue('id'))

      const togglePlay = () => {
        const audioUrl = row.getValue('recordingUrl')
        const id = row.getValue('id')

        // If this audio is currently playing, stop it
        if (isPlaying.value) {
          currentPlayingAudio.value?.pause()
          currentPlayingAudio.value = null
          currentPlayingId.value = null
          return
        }

        // Stop any currently playing audio
        if (currentPlayingAudio.value) {
          currentPlayingAudio.value.pause()
          currentPlayingAudio.value = null
        }

        // Play the new audio
        const audio = new Audio(audioUrl)
        audio.addEventListener('ended', () => {
          currentPlayingAudio.value = null
          currentPlayingId.value = null
        })
        audio.play()
        currentPlayingAudio.value = audio
        currentPlayingId.value = id
      }

      return h(UButton, {
        icon: isPlaying.value ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
        size: 'sm',
        color: isPlaying.value ? 'error' : 'primary',
        variant: isPlaying.value ? 'solid' : 'ghost',
        class: 'hover:scale-110 transition-transform',
        onClick: togglePlay
      })
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (row) => {
      return h(UBadge, { class: 'capitalize', variant: 'subtle' }, () =>
        row.getValue('status')
      )
    }
  },
  {
    accessorKey: 'id',
    header: 'Actions',
    cell: (row) => {
      return h('div', { class: 'flex gap-2' }, [
        h(UButton, { 
          label: 'View Transcript',
          onClick: () => {
            const call = calls.value.find(c => c.id === row.getValue("id"))
            selectedCall.value = call
            isModalOpen.value = true
          }
        })
      ])
    }
  }
]

const startDate = ref(new Date(Date.now()).toISOString().split('T')[0])
const endDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])

const callStatus = ref('')
const sortBy = ref('date')
const sortDirection = ref('desc')

const { data: calls } = await useFetch('/api/calls')

// Sort handler
const handleSort = (column) => {
  if (sortBy.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column.key
    sortDirection.value = 'asc'
  }
}

// Filter and sort logic
const filteredCalls = computed(() => {
  let filtered = calls.value || []

  if (startDate.value && endDate.value) {
    filtered = filtered.filter(call => {
      const callDate = new Date(call.startedAt)
      return callDate >= new Date(startDate.value) && 
             callDate <= new Date(endDate.value)
    })
  }

  if (callStatus.value) {
    filtered = filtered.filter(call => call.status === callStatus.value)
  }

  return filtered
})

// Add this before component unmounts
onBeforeUnmount(() => {
  if (currentPlayingAudio.value) {
    currentPlayingAudio.value.pause()
    currentPlayingAudio.value = null
    currentPlayingId.value = null
  }
})
</script>

<style scoped>
.call-list-page {
  padding: 1rem;
}

.filters {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>
