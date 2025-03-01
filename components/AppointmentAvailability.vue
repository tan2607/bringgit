<template>
  <div class="appointment-availability">
    <UAccordion :items="accordionItems">
      <template #default="{ item, index, open }">
        <div class="p-4">
          <div v-if="item.dates && item.dates.length > 0">
            <div v-for="date in item.dates" :key="date.date" class="mb-4">
              <h3 class="text-lg font-semibold mb-2">{{ date.date }}</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <UButton
                  v-for="time in date.availableTimes"
                  :key="time"
                  :color="isTimeSelected(date.date, time) ? 'primary' : 'gray'"
                  variant="soft"
                  size="sm"
                  class="text-sm"
                  @click="selectTime(date.date, time)"
                >
                  {{ time }}
                </UButton>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 italic">
            No available appointment times found
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface AppointmentTime {
  date: string
  availableTimes: string[]
}

const props = defineProps<{
  availabilityData: AppointmentTime[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedDate', value: string): void
  (e: 'update:selectedTime', value: string): void
}>()

const selectedDate = ref('')
const selectedTime = ref('')

// Create accordion items
const accordionItems = computed(() => {
  return [
    {
      label: 'Available Appointment Times',
      icon: 'i-heroicons-calendar',
      description: 'Select a date and time for your appointment',
      dates: props.availabilityData
    }
  ]
})

// Check if a time is selected
function isTimeSelected(date: string, time: string) {
  return selectedDate.value === date && selectedTime.value === time
}

// Select a time
function selectTime(date: string, time: string) {
  selectedDate.value = date
  selectedTime.value = time
  
  // Emit the selected date and time
  emit('update:selectedDate', date)
  emit('update:selectedTime', time)
}
</script>

<style scoped>
.appointment-availability {
  margin-top: 1rem;
}
</style>
