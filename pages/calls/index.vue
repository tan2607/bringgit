<template>
  <div class="call-list-page p-4">
    <h1 class="text-2xl font-bold mb-4">Call List</h1>
    
    <!-- Filters -->
    <div class="filters flex gap-4 mb-4">
      <UForm label="Date Range">
        <div class="flex gap-2">
          <UInput type="date" v-model="startDate" />
          <UInput type="date" v-model="endDate" />
        </div>
      </UForm>
      <USelect 
        v-model="callStatus"
        :items="[
          { label: 'Queued', value: 'queued' },
          { label: 'Ended', value: 'ended' }
        ]"
      />
    </div>
<!-- 
    :columns="columns"
      :sort="{ column: sortBy, direction: sortDirection }"
      @sort="handleSort" -->
    <!-- Table -->
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
          <p class="text-sm text-gray-600">{{ selectedCall?.transcript }}</p>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, resolveComponent, h } from 'vue';
import { formatTimeAgo } from '@vueuse/core'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const isModalOpen = ref(false)
const selectedCall = ref(null)

// Define columns for the call data
const columns = [
  {
    accessorKey: "id",
    header: "#",
    cell: (row) => row.getValue("id").slice(0, 6)
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
    accessorKey: "recordingUrl",
    header: "Playback",
    cell: (row) => {
      return h('audio', { controls: true, preload: "none", src: row.getValue('recordingUrl') });
    }
  },
  {
    accessorKey: 'startedAt',
    header: 'Started on',
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
  {
    accessorKey: 'endedAt',
    header: 'Ended on',
    sortable: true,
    cell: (row) =>  {
      const time = new Date(row.getValue('startedAt'));
      const timeAgo = formatTimeAgo(time) // string

      return time.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ` (${timeAgo})`}
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

const startDate = ref(new Date().toISOString().split('T')[0])
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
      const callDate = new Date(call.createdAt)
      return callDate >= new Date(startDate.value) && 
             callDate <= new Date(endDate.value)
    })
  }

  if (callStatus.value) {
    filtered = filtered.filter(call => call.status === callStatus.value)
  }

  return filtered
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
