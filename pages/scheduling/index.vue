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
      <UModal 
        :open="openScheduleModal" 
        title="Schedule New Call"
        description="Fill in the details below to schedule your call."
        :close="false"
      >
        <template #body>
          <UForm 
            :schema="scheduleFormSchema" 
            :state="newCall" 
            class="space-y-4" 
            @submit="scheduleCall"
          >
            <UFormField label="Recipient" name="recipient">
              <UInput v-model="newCall.recipient" class="w-full" />
            </UFormField>
            
            <UFormField label="Date & Time" name="datetime">
              <UInput type="datetime-local" v-model="newCall.datetime" class="w-full" />
            </UFormField>
            
            <UFormField label="Notes" name="notes">
              <UTextarea v-model="newCall.notes" placeholder="Add notes..." class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-2 mt-4">
              <UButton label="Cancel" color="gray" variant="outline" @click="openScheduleModal = false" />
              <UButton type="submit" label="Schedule" color="primary" />
            </div>
          </UForm>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" })

import { ref, reactive } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const selectedDate = ref(new Date())
const openScheduleModal = ref(false)

const scheduleFormSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  datetime: z.date(),
  notes: z.string().optional()
})

type ScheduleFormSchema = z.output<typeof scheduleFormSchema>

const newCall = reactive<Partial<ScheduleFormSchema>>({
  recipient: undefined,
  datetime: new Date(),
  notes: undefined
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

const toast = useToast()

const scheduleCall = async (event: FormSubmitEvent<ScheduleFormSchema>) => {
  const result = await scheduleFormSchema.safeParseAsync(newCall)

  if (!result.success) {
    return
  }

  toast.add({
    title: 'Success',
    description: 'Call has been scheduled successfully.',
    color: 'success'
  })

  // Reset form
  newCall.recipient = undefined
  newCall.datetime = new Date()
  newCall.notes = undefined
  openScheduleModal.value = false
}
</script>

<style scoped>
/* Add styles for the scheduling overview page */
</style>
