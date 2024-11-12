<template>
  <div class="scheduling-overview p-6">
    <UContainer>
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Call Scheduling</h1>
        <p class="text-gray-500">Manage and schedule your outbound calls</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar Section -->
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Calendar View</h2>
              <UButton 
                icon="i-lucide-plus" 
                label="Schedule Call"
                @click="openScheduleModal = true"
              />
            </div>
          </template>
          <UCalendar 
            v-model="selectedDate"
            :events="calendarEvents"
            class="w-full"
          />
        </UCard>

        <!-- Upcoming Calls Section -->
        <UCard class="lg:col-span-1">
          <template #header>
            <h2 class="text-lg font-semibold">Upcoming Calls</h2>
          </template>
          <UTable 
            :rows="upcomingCalls" 
            :columns="columns"
          >
            <template #actions-data="{ row }">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-lucide-more-vertical"
                @click="showCallDetails(row)"
              />
            </template>
          </UTable>
        </UCard>
      </div>

      <!-- Schedule Call Modal -->
      <UModal v-model="openScheduleModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Schedule New Call</h3>
          </template>
          <UForm @submit.prevent="scheduleCall">
            <UFormField label="Recipient">
              <UInput v-model="newCall.recipient" placeholder="Enter recipient" />
            </UFormField>
            <UFormField label="Date & Time">
              <UDatePicker v-model="newCall.datetime" />
            </UFormField>
            <UFormField label="Notes">
              <UTextarea v-model="newCall.notes" placeholder="Add notes..." />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton color="gray" @click="openScheduleModal = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary">
                Schedule Call
              </UButton>
            </div>
          </UForm>
        </UCard>
      </UModal>
    </UContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedDate = ref(new Date())
const openScheduleModal = ref(false)

const newCall = ref({
  recipient: '',
  datetime: new Date(),
  notes: ''
})

const columns = [
  {
    id: 1,
    key: 'datetime',
    label: 'Date & Time',
    sortable: true
  },
  {
    id: 2,
    key: 'recipient',
    label: 'Recipient'
  },
  {
    id: 3,
    key: 'actions',
    label: 'Actions'
  }
]

const upcomingCalls = ref([
  {
    id: 1,
    datetime: '2024-03-20 10:00 AM',
    recipient: 'John Doe'
  },
  {
    id: 2,
    datetime: '2024-03-21 2:30 PM',
    recipient: 'Jane Smith'
  }
])

const calendarEvents = ref([
  {
    date: '2024-03-20',
    label: 'Call with John Doe',
    color: 'primary'
  },
  {
    date: '2024-03-21',
    label: 'Call with Jane Smith',
    color: 'primary'
  }
])

const startDate = ref(new Date().toISOString().split('T')[0])

const showCallDetails = (call) => {
  console.log('Show details for call:', call)
}

const scheduleCall = () => {
  console.log('Scheduling call:', {
    ...newCall.value,
    date: startDate.value
  })
  openScheduleModal.value = false
}
</script>

<style scoped>
/* Add styles for the scheduling overview page */
</style>
