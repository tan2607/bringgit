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
          { label: 'All', value: 'all' },
          { label: 'Queued', value: 'queued' },
          { label: 'Ended', value: 'ended' }
        ]"
      />
    </div>

    <!-- Table -->
    <UTable 
      :rows="filteredCalls" 
      :columns="columns"
      :sort="{ column: sortBy, direction: sortDirection }"
      @sort="handleSort"
    >
      <template #status-data="{ row }">
        <UBadge :color="row.status === 'ended' ? 'green' : 'blue'">
          {{ row.status }}
        </UBadge>
      </template>
    </UTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Define columns for the call data
const columns = [
  {
    id:1,
    key: 'createdAt',
    label: 'Date',
    sortable: true,
    render: (date) => new Date(date).toLocaleString()
  },
  {
    id:2,
    key: 'type',
    label: 'Type',
    sortable: true
  },
  {
    id:3,
    key: 'status',
    label: 'Status',
    sortable: true
  },
  {
    id:4,
    key: 'cost',
    label: 'Cost',
    sortable: true,
    render: (cost) => `$${cost.toFixed(2)}`
  },
  {
    id:5,
    key: 'duration',
    label: 'Duration',
    sortable: true,
    render: (row) => {
      if (row.startedAt && row.endedAt) {
        const duration = new Date(row.endedAt) - new Date(row.startedAt)
        return `${Math.round(duration / 1000)}s`
      }
      return '-'
    }
  },
  {
    id:6,
    key: 'summary',
    label: 'Summary',
    render: (row) => row.analysis?.summary || '-'
  }
]

const startDate = ref('')
const endDate = ref('')
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
