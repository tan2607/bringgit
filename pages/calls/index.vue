<template>
  <UContainer class="my-8">
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

    <CallTable :data="filteredCalls" />

    <!-- Modal -->
    <UModal :open="callsStore.isModalOpen" title="Call Summary" :description="callsStore.selectedCall?.summary" :close="false">
      <template #body>
        <div>
          <h4 class="font-medium mb-2">Transcript</h4>
            <UTextarea v-model="callsStore.selectedCall.transcript" autoresize :maxrows="10" disabled highlight class="w-full"></UTextarea>
        </div>
      </template>

      <template #footer>
          <UButton color="neutral" @click="callsStore.isModalOpen = false">Close</UButton>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useCallsStore } from '@/stores/calls'
import CallTable from '@/components/CallTable.vue'

const callsStore = useCallsStore()
const startDate = ref(new Date(Date.now() - (7 * 86400000)).toISOString().split('T')[0])
const endDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])
const callStatus = ref('ended')

const filteredCalls = computed(() => 
  callsStore.filteredCalls(startDate.value, endDate.value, callStatus.value)
)

// Fetch calls when component mounts
await callsStore.fetchCalls()

onBeforeUnmount(() => {
  callsStore.stopCurrentAudio()
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
