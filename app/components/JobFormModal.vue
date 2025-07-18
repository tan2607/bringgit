<!-- components/JobFormModal.vue -->
<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)" :ui="{ width: 'sm:max-w-lg', margin: 'my-0' }">
    <template #content>
    <UCard class="overflow-y-auto max-h-[80vh]">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            :name="editingJob ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'"
            class="h-5 w-5"
          />
          <h3 class="text-lg font-semibold">
            {{ editingJob ? 'Edit Calling Task' : 'Create New Calling Task' }}
          </h3>
        </div>
      </template>

      <UForm
        :schema="jobFormSchema"
        :state="jobForm"
        class="space-y-4 w-full"
        @submit="handleSubmit"
      >
        <UFormField
          name="name"
          label="Task Name"
        >
          <UInput
            v-model="jobForm.name"
            placeholder="Enter task name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="schedule"
          label="Schedule"
        >
          <UCalendar v-model="scheduleDate" class="w-full" :is-date-disabled="isDateDisabled" />
        </UFormField>

        <UFormField
          name="phoneNumbers"
          label="Phone Numbers"
        >
          <div class="space-y-2">
            <div v-if="jobForm.phoneNumbers">
              <UTextarea
              v-model="jobForm.phoneNumbers"
              rows="4"
              class="w-full"
              readonly
            />
              <div class="text-xs text-gray-500">
                {{ getPhoneNumberCount() }} numbers 
              </div>
            </div>
            <UButton
              color="primary"
              icon="i-heroicons-document-text"
              ref="fileInput"
              @click="uploadPhoneNumbers"
            >
              Upload Phone Numbers
            </UButton>
            <input id="file-input" ref="fileInput" type="file" accept=".csv,.xlsx,.xls" @input="handleFileInput" class="hidden"/>
          </div>
        </UFormField>

        <UFormField name="selectedTimeWindow" label="Time Window">
          <USelect
            v-model="jobForm.selectedTimeWindow"
            :items="timeWindowOptions"
            placeholder="Select a time window"
            class="w-full"
          />
          <UCheckbox v-model="jobForm.allowWeekends" label="Allow on weekends" class="mt-2"/>
        </UFormField>

        <UFormField
          name="assistantId"
          label="Assistant"
        >
          <USelect
            v-model="jobForm.assistantId"
            :items="assistantOptions"
            placeholder="Select an assistant"
            class="w-full"
            value-key="id"
            label-key="name"
          />
        </UFormField>

        <UFormField
          name="phoneNumberId"
          label="Outbound Number"
        >
          <USelect
            v-model="jobForm.phoneNumberId"
            :items="formattedPhoneNumber"
            placeholder="Select a phone number"
            class="w-full"
            multiple
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="ghost"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="isSubmitting"
          >
            {{ editingJob ? 'Save Changes' : 'Create Job' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Job } from '@@/types'
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'
import { CalendarDate, today } from '@internationalized/date'
import type { Matcher } from '#ui/types'
import type { Assistant } from '@@/types/assistant'
import * as XLSX from 'xlsx'

const props = defineProps<{
  modelValue: boolean
  editingJob?: Job | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [jobData: any]
  'refreshEditJob': []
}>()

const assistantOptions = defineModel<Assistant[]>('assistantOptions', { required: true })
const phoneNumberOptions = defineModel<any[]>('phoneNumberOptions', { required: true })
const currentDate = today("Asia/Singapore");
// Form validation schema
const jobFormSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  schedule: z.date().min(new Date(new Date().setHours(0, 0, 0, 0)), 'Schedule must be in the future'),
  phoneNumbers: z.string().min(1, 'At least one phone number is required'),
  assistantId: z.string().min(1, 'Assistant is required'),
  phoneNumberId: z.array(z.string()).min(1, 'Phone number is required'),
  selectedTimeWindow: z.object({
    start: z.number().min(0).max(24),
    end: z.number().min(0).max(24)
  })
})

type JobFormSchema = z.output<typeof jobFormSchema>

// Form state
const isSubmitting = ref(false)

const isDateDisabled: Matcher = (date) => {
  return date.compare(currentDate) < 0
}

const timeWindowOptions = [
  { label: '8 AM - 4 PM', value: { start: 8, end: 16 } },
  { label: '9 AM - 5 PM', value: { start: 9, end: 17 } },
  { label: '9 AM - 8 PM', value: { start: 9, end: 20 } },
  { label: '9 AM - 9 PM', value: { start: 9, end: 21 } },
  { label: '10 AM - 6 PM', value: { start: 10, end: 18 } },
  { label: '10 AM - 9 PM', value: { start: 10, end: 21 } },
  { label: '11 AM - 9 PM', value: { start: 11, end: 21 } },
  { label: "Anytime", value: { start: 0, end: 24 } }
]

const jobForm = ref({
  name: '',
  schedule: new Date(),
  phoneNumbers: '',
  assistantId: '',
  phoneNumberId: [],
  selectedTimeWindow: {
    start: 9,
    end: 17
  },
  names: [],
  allowWeekends: false
})

const scheduleDate = ref(currentDate);
// Update jobForm.schedule when scheduleDate changes
watch(scheduleDate, (newDate) => {
  if(!newDate){
    return
  }
  jobForm.value.schedule = new Date(newDate.year, newDate.month - 1, newDate.day)
})

// Methods
const getPhoneNumberCount = () => {
  return jobForm.value.phoneNumbers
    .split('\n')
    .map(n => n.trim())
    .filter(Boolean).length
}

const handleSubmit = async (event: FormSubmitEvent<JobFormSchema>) => {
  isSubmitting.value = true
  try {
    const phoneNumbers = event.data.phoneNumbers
      .split('\n')
      .map(n => n.trim())
      .filter(Boolean)

    const jobData = {
      ...event.data,
      phoneNumbers: phoneNumbers,
      names: jobForm.value.names,
      phoneNumberId: jobForm.value.phoneNumberId,
      selectedTimeWindow: {
        start: jobForm.value.selectedTimeWindow.start,
        end: jobForm.value.selectedTimeWindow.end,
        allowWeekends: jobForm.value.allowWeekends
      },
      totalCalls: phoneNumbers.length,
    }
    emit('submit', jobData)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to submit job:', error)
  } finally {
    isSubmitting.value = false
  }
}

const formattedPhoneNumber = computed(() => {
  return phoneNumberOptions.value.map(phone => {
    return {
      label: `${phone.number} (${phone.name})`,
      value: phone.id
    }
  })
})

const fileInput = ref<HTMLInputElement | null>(null)

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  try {
    const data = await readFileAsArrayBuffer(file)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const rows = XLSX.utils.sheet_to_json(worksheet)

    if (rows.length === 0) {
      throw new Error('File is empty')
    }

    // Check if phone_number column exists
    const firstRow = rows[0] as any
    if (!('phone_number' in firstRow)) {
      throw new Error('File must contain a phone_number column')
    }
    if(!jobForm.value.phoneNumbers){
      jobForm.value.phoneNumbers += rows.map((row: any) => `+${row.phone_number}`).join('\n')
    } else {
      jobForm.value.phoneNumbers += '\n' + rows.map((row: any) => `+${row.phone_number}`).join('\n')
    }
    jobForm.value.names.push(...rows.map((row: any) => row.name))
    
  } catch (error: any) {
    console.error('Error processing file:', error)
    // You might want to show an error message to the user here
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
    reader.onerror = (e) => reject(e)
    reader.readAsArrayBuffer(file)
  })
}

function uploadPhoneNumbers() {
  fileInput.value?.click()
}
// Watch for editingJob changes to update form
watch(() => props.editingJob, (job) => {
  if (job) {
    const selectedTimeWindow = JSON.parse(job.selectedTimeWindow)

    let phoneNumberId = []
    try {
      phoneNumberId = JSON.parse(job.phoneNumberId)
    } catch (error) {
      phoneNumberId = [job.phoneNumberId]
    }

    jobForm.value = {
      ...job,
      phoneNumbers: JSON.parse(job.phoneNumbers).join('\n'),
      selectedTimeWindow: {
        start: selectedTimeWindow.start,
        end: selectedTimeWindow.end
      },
      names: JSON.parse(job.names),
      phoneNumberId,
      allowWeekends: selectedTimeWindow.allowWeekends
    }
    const schedule = new Date(job.schedule)
    scheduleDate.value = new CalendarDate(schedule.getFullYear(), schedule.getMonth() + 1, schedule.getDate());
  } else {
    jobForm.value = {
      name: '',
      schedule: new Date(),
      phoneNumbers: '',
      assistantId: '',
      phoneNumberId: [],
      selectedTimeWindow: {
        start: 9,
        end: 17
      },
      names: []
    }
  }
}, { immediate: true })

</script>
