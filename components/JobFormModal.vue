<!-- components/JobFormModal.vue -->
<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)" :ui="{ width: 'sm:max-w-lg' }">
    <template #content>
    <UCard>
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
            <UTextarea
              v-model="jobForm.phoneNumbers"
              placeholder="Enter phone numbers (one per line)"
              rows="4"
              class="w-full"
            />
            <div class="text-xs text-gray-500">
              {{ getPhoneNumberCount() }} numbers entered
            </div>
          </div>
        </UFormField>

        <UFormField
          name="assistantId"
          label="Assistant"
        >
          <USelect
            v-model="jobForm.assistantId"
            :options="assistantOptions"
            placeholder="Select an assistant"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="phoneNumberId"
          label="Outbound Number"
        >
          <USelect
            v-model="jobForm.phoneNumberId"
            :options="phoneNumberOptions"
            placeholder="Select a phone number"
            class="w-full"
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
import type { Job } from '~/types'
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'
import { CalendarDate, today } from '@internationalized/date'
import type { Matcher } from '#ui/types'

const props = defineProps<{
  modelValue: boolean
  editingJob?: Job | null
  assistantOptions: Array<{ label: string; value: string }>
  phoneNumberOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [jobData: any]
}>()

// Form validation schema
const jobFormSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  schedule: z.date().min(new Date(), 'Schedule must be in the future'),
  phoneNumbers: z.string().min(1, 'At least one phone number is required'),
  assistantId: z.string().min(1, 'Assistant is required'),
  phoneNumberId: z.string().min(1, 'Phone number is required')
})

type JobFormSchema = z.output<typeof jobFormSchema>

// Form state
const isSubmitting = ref(false)
const currentDate = today()
const scheduleDate = ref(currentDate)

const isDateDisabled: Matcher = (date) => {
  return date.compare(currentDate) < 0
}

const jobForm = ref({
  name: '',
  schedule: new Date(),
  phoneNumbers: '',
  assistantId: '',
  phoneNumberId: ''
})

// Update jobForm.schedule when scheduleDate changes
watch(scheduleDate, (newDate) => {
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
      phoneNumbers
    }

    emit('submit', jobData)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Failed to submit job:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for editingJob changes to update form
watch(() => props.editingJob, (job) => {
  if (job) {
    jobForm.value = {
      ...job,
      phoneNumbers: job.phoneNumbers.join('\n')
    }
  } else {
    jobForm.value = {
      name: '',
      schedule: new Date(),
      phoneNumbers: '',
      assistantId: '',
      phoneNumberId: ''
    }
  }
}, { immediate: true })
</script>
