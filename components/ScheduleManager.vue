<template>
  <div class="space-y-6">
    <!-- Business Hours -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Business Hours</h3>
          <UButton
            icon="i-lucide-clock"
            color="info"
            variant="ghost"
            @click="showBusinessHoursModal = true"
          >
            Edit Hours
          </UButton>
        </div>
      </template>
      
      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="day in daysOfWeek"
          :key="day.value"
          class="flex flex-col items-center p-2 rounded"
          :class="schedule.businessHours.daysOfWeek.includes(day.value) ? 'bg-primary-50' : 'bg-gray-50'"
        >
          <span class="font-medium">{{ day.short }}</span>
          <span class="text-sm" v-if="schedule.businessHours.daysOfWeek.includes(day.value)">
            {{ schedule.businessHours.startTime }} - {{ schedule.businessHours.endTime }}
          </span>
          <span v-else class="text-sm text-gray-500">Off</span>
        </div>
      </div>
    </UCard>

    <!-- Blackout Periods -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Blackout Periods</h3>
          <UButton
            icon="i-lucide-calendar-off"
            color="warning"
            variant="ghost"
            @click="showBlackoutModal = true"
          >
            Add Period
          </UButton>
        </div>
      </template>

      <UTable
        :rows="schedule.blackoutPeriods"
        :columns="[
          { key: 'start', label: 'Start' },
          { key: 'end', label: 'End' },
          { key: 'reason', label: 'Reason' },
          { key: 'actions', label: '' }
        ]"
      >
        <template #reason-data="{ row }">
          {{ row.reason || 'No reason provided' }}
        </template>
        <template #actions-data="{ row }">
          <UButton
            icon="i-lucide-trash"
            color="error"
            variant="ghost"
            size="xs"
            @click="removeBlackoutPeriod(row)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Priority Windows -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Priority Windows</h3>
          <UButton
            icon="i-lucide-star"
            color="primary"
            variant="ghost"
            @click="showPriorityModal = true"
          >
            Add Window
          </UButton>
        </div>
      </template>

      <UTable
        :rows="schedule.priorityWindows"
        :columns="[
          { key: 'startTime', label: 'Start Time' },
          { key: 'endTime', label: 'End Time' },
          { key: 'priority', label: 'Priority' },
          { key: 'actions', label: '' }
        ]"
      >
        <template #priority-data="{ row }">
          <UBadge :color="getPriorityColor(row.priority)">
            Priority {{ row.priority }}
          </UBadge>
        </template>
        <template #actions-data="{ row }">
          <UButton
            icon="i-lucide-trash"
            color="error"
            variant="ghost"
            size="xs"
            @click="removePriorityWindow(row)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Business Hours Modal -->
    <UModal v-model="showBusinessHoursModal">
      <UCard>
        <template #header>Edit Business Hours</template>
        
        <div class="space-y-4">
          <div class="grid grid-cols-7 gap-2">
            <UCheckbox
              v-for="day in daysOfWeek"
              :key="day.value"
              v-model="selectedDays"
              :value="day.value"
              :label="day.short"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <USelect
              v-model="businessHours.startTime"
              :options="timeOptions"
              label="Start Time"
            />
            <USelect
              v-model="businessHours.endTime"
              :options="timeOptions"
              label="End Time"
            />
          </div>

          <USelect
            v-model="businessHours.timezone"
            :options="timezoneOptions"
            label="Timezone"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showBusinessHoursModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="saveBusinessHours"
            >
              Save
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Blackout Period Modal -->
    <UModal v-model="showBlackoutModal">
      <UCard>
        <template #header>Add Blackout Period</template>
        
        <div class="space-y-4">
          <UDatePicker
            v-model="blackoutPeriod.start"
            label="Start Date"
            :min="new Date()"
          />
          <UDatePicker
            v-model="blackoutPeriod.end"
            label="End Date"
            :min="blackoutPeriod.start || new Date()"
          />
          <UInput
            v-model="blackoutPeriod.reason"
            label="Reason"
            placeholder="Optional reason for blackout"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showBlackoutModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="saveBlackoutPeriod"
            >
              Save
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Priority Window Modal -->
    <UModal v-model="showPriorityModal">
      <UCard>
        <template #header>Add Priority Window</template>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <USelect
              v-model="priorityWindow.startTime"
              :options="timeOptions"
              label="Start Time"
            />
            <USelect
              v-model="priorityWindow.endTime"
              :options="timeOptions"
              label="End Time"
            />
          </div>

          <USelect
            v-model="priorityWindow.priority"
            :options="[1,2,3,4,5].map(n => ({
              label: `Priority ${n}`,
              value: n
            }))"
            label="Priority Level"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showPriorityModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="savePriorityWindow"
            >
              Save
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { BusinessHours, BlackoutPeriod, PriorityWindow } from '@/server/utils/scheduler'

const schedule = useState('schedule', () => ({
  businessHours: {
    daysOfWeek: [],
    startTime: '09:00',
    endTime: '17:00'
  },
  blackoutPeriods: [],
  priorityWindows: []
}))

const showBusinessHoursModal = useState('showBusinessHoursModal', false)
const showBlackoutModal = useState('showBlackoutModal', false)
const showPriorityModal = useState('showPriorityModal', false)

// Business Hours
const businessHours = useState('businessHours', {
  startTime: '09:00',
  endTime: '17:00',
  timezone: ''
})
const selectedDays = useState('selectedDays', [])

const daysOfWeek = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
]

// Generate time options (every 30 minutes)
const timeOptions = useState('timeOptions', () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push({ label: time, value: time })
    }
  }
  return options
})

// Timezone options
const timezoneOptions = useState('timezoneOptions', () => {
  return Intl.supportedValuesOf('timeZone').map(tz => ({
    label: tz,
    value: tz
  }))
})

// Blackout Period
const blackoutPeriod = useState('blackoutPeriod', {
  start: new Date(),
  end: new Date(),
  reason: ''
})

// Priority Window
const priorityWindow = useState('priorityWindow', {
  startTime: '09:00',
  endTime: '17:00',
  priority: 1
})

// Save functions
const saveBusinessHours = () => {
  schedule.value = {
    ...schedule.value,
    businessHours: {
      ...businessHours.value,
      daysOfWeek: selectedDays.value
    }
  }
  showBusinessHoursModal.value = false
}

const saveBlackoutPeriod = () => {
  if (blackoutPeriod.value.start && blackoutPeriod.value.end) {
    schedule.value = {
      ...schedule.value,
      blackoutPeriods: [
        ...schedule.value.blackoutPeriods,
        { ...blackoutPeriod.value }
      ]
    }
    showBlackoutModal.value = false
    blackoutPeriod.value = {
      start: new Date(),
      end: new Date(),
      reason: ''
    }
  }
}

const savePriorityWindow = () => {
  schedule.value = {
    ...schedule.value,
    priorityWindows: [
      ...schedule.value.priorityWindows,
      { ...priorityWindow.value }
    ]
  }
  showPriorityModal.value = false
  priorityWindow.value = {
    startTime: '09:00',
    endTime: '17:00',
    priority: 1
  }
}

// Remove functions
const removeBlackoutPeriod = (period: BlackoutPeriod) => {
  schedule.value = {
    ...schedule.value,
    blackoutPeriods: schedule.value.blackoutPeriods.filter(p => p !== period)
  }
}

const removePriorityWindow = (window: PriorityWindow) => {
  schedule.value = {
    ...schedule.value,
    priorityWindows: schedule.value.priorityWindows.filter(w => w !== window)
  }
}

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return 'error'
    case 2: return 'warning'
    case 3: return 'info'
    case 4: return 'success'
    default: return 'primary'
  }
}
</script>
