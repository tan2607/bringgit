<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-workflow" class="text-primary" />
          <h3 class="text-xl font-semibold">Home Sleep Study Workflow</h3>
        </div>
      </template>

      <UStepper
        v-model="currentStep"
        :items="steps"
        orientation="vertical"
        class="mb-8"
      >
        <template #item="{ item, index }">
          <div class="flex items-center gap-2">
            <div v-if="isStepComplete(index)" class="text-green-500">
              <UIcon name="i-lucide-check-circle" />
            </div>
            <span>{{ item.title }}</span>
          </div>
        </template>

        <template #step-2>
          <DocumentUpload @update:data="updatePatientData" />
        </template>

        <template #step-3>
          <RpaTask 
            :initial-url="defaultRpaUrl"
            :initial-task-description="defaultTaskDescription"
            @success="handleRpaSuccess"
            @error="handleRpaError"
          />
        </template>

        <template #step-4>
          <RpaTask 
            :initial-url="insuranceVerificationUrl"
            :initial-task-description="insuranceVerificationSteps"
            @success="handleRpaSuccess"
            @error="handleRpaError"
          />
        </template>

        <template #step-5>
          <div class="max-w-3xl mx-auto py-8 px-4">
            <h2 class="text-2xl font-bold mb-8">Scheduling Assignment</h2>
            
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar-check" class="text-primary" />
                  <h3 class="font-medium">Assign to Scheduler</h3>
                </div>
              </template>

              <div class="space-y-4">
                <UFormField label="Select Scheduler">
                  <USelect
                    v-model="selectedScheduler"
                    :items="schedulers"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Priority">
                  <USelect
                    v-model="priority"
                    :items="priorityOptions"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Notes">
                  <UTextarea
                    class="w-full"
                    v-model="schedulingNotes"
                    placeholder="Add any special instructions or notes for the scheduler"
                  />
                </UFormField>
              </div>

              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton
                    color="primary"
                    :loading="isSubmitting"
                    @click="handleAssignScheduler"
                  >
                    Assign
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </template>

        <template #step-6>
          <div class="max-w-3xl mx-auto py-8 px-4">
            <h2 class="text-2xl font-bold mb-8">Patient Scheduling</h2>
            
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar" class="text-primary" />
                  <h3 class="font-medium">Schedule Appointment</h3>
                </div>
              </template>

              <div class="space-y-4">
                <UFormField label="Patient Phone Number">
                  <UInput
                    v-model="patientPhone"
                    placeholder="Enter phone number (E.164 format, e.g., +6597599995)"
                    class="w-full"
                  />
                </UFormField>

                <div class="flex items-center gap-4">
                  <UButton
                    color="primary"
                    :loading="isCallLoading"
                    :disabled="!isValidPhoneNumber"
                    icon="i-lucide-phone-outgoing"
                    @click="initiateCall"
                  >
                    Call Patient
                  </UButton>
                  
                  <UBadge
                    v-if="callStatus"
                    :color="callStatus === 'ended' ? 'success' : 'info'"
                  >
                    {{ callStatus }}
                  </UBadge>
                </div>

                <UDivider />

                <UFormField label="Appointment Date">
                  <UInput type="date" v-model="appointmentDate" class="w-full" />
                </UFormField>

                <UFormField label="Time Slot">
                  <USelect
                    v-model="timeSlot"
                    :items="availableTimeSlots"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Payment Method">
                  <USelect
                    v-model="paymentMethod"
                    :items="paymentMethods"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Additional Notes">
                  <UTextarea
                    v-model="appointmentNotes"
                    placeholder="Any special requirements or notes"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton
                    color="primary"
                    :loading="isSubmitting"
                    @click="handleScheduleAppointment"
                  >
                    Schedule
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </template>

        <template #step-7>
          <RpaTask 
            :initial-url="shippingSystemUrl"
            :initial-task-description="shippingSteps"
            @success="handleRpaSuccess"
            @error="handleRpaError"
          />
        </template>

        <template #step-8>
          <div class="max-w-3xl mx-auto py-8 px-4">
            <h2 class="text-2xl font-bold mb-8">Virtual Setup</h2>
            
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-video" class="text-primary" />
                  <h3 class="font-medium">Virtual Appointment</h3>
                </div>
              </template>

              <div class="space-y-4">
                <UAlert
                  color="info"
                  variant="soft"
                  icon="i-lucide-info"
                  title="Meeting Details"
                  :description="'Meeting scheduled for ' + appointmentDate + ' at ' + timeSlot"
                />

                <div class="flex justify-center">
                  <UButton
                    size="lg"
                    color="primary"
                    icon="i-lucide-video"
                    @click="joinMeeting"
                  >
                    Join Meeting
                  </UButton>
                </div>

                <UDivider />

                <UFormField label="Meeting Notes">
                  <UTextarea
                    v-model="meetingNotes"
                    placeholder="Record any issues or follow-up items"
                  />
                </UFormField>
              </div>

              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton
                    color="primary"
                    :loading="isSubmitting"
                    @click="completeMeeting"
                  >
                    Complete Setup
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </template>

        <template #step-9>
          <div class="max-w-3xl mx-auto py-8 px-4">
            <h2 class="text-2xl font-bold mb-8">Test Completion</h2>
            
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="text-primary" />
                  <h3 class="font-medium">Test Status</h3>
                </div>
              </template>

              <div class="space-y-4">
                <UAlert
                  color="info"
                  variant="soft"
                  icon="i-lucide-package"
                  title="Equipment Return"
                  description="Patient has been provided with a pre-paid shipping label for equipment return"
                />

                <UFormField label="Test Status">
                  <USelect
                    v-model="testStatus"
                    :items="testStatusOptions"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Equipment Return Status">
                  <USelect
                    v-model="equipmentStatus"
                    :items="equipmentStatusOptions"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Notes">
                  <UTextarea
                    class="w-full"
                    v-model="testNotes"
                    placeholder="Any issues or observations during the test"
                  />
                </UFormField>
              </div>

              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton
                    color="primary"
                    :loading="isSubmitting"
                    @click="completeTest"
                  >
                    Mark Complete
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </template>

        <template #step-10>
          <RpaTask 
            :initial-url="diagnosticSystemUrl"
            :initial-task-description="diagnosticSteps"
            @success="handleRpaSuccess"
            @error="handleRpaError"
          />
        </template>

        <template #step-11>
          <RpaTask 
            :initial-url="doctorPortalUrl"
            :initial-task-description="doctorReviewSteps"
            @success="handleRpaSuccess"
            @error="handleRpaError"
          />
        </template>

        <template #step-12>
          <RpaTask 
            :initial-url="billingSystemUrl"
            :initial-task-description="billingSteps"
            @success="handleRpaSuccess"
            @error="handleRpaError"
          />
        </template>
      </UStepper>

      <div class="mt-8 space-y-6">
        <h3 class="text-xl font-semibold">Process Notes & Definitions</h3>
        
        <UAccordion :items="processNotes" variant="soft" />

        <div class="mt-8">
          <h4 class="text-lg font-semibold mb-4">Available Services</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <UCard v-for="service in services" :key="service.title" class="h-full">
              <template #header>
                <h5 class="font-medium">{{ service.title }}</h5>
              </template>
              <p class="text-sm">{{ service.description }}</p>
              <ul v-if="service.details" class="mt-2 text-sm list-disc list-inside space-y-1">
                <li v-for="detail in service.details" :key="detail">{{ detail }}</li>
              </ul>
            </UCard>
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import DocumentUpload from '~/components/DocumentUpload.vue'
import RpaTask from '~/components/RpaTask.vue'
import { patientIntakeFormSchema } from '~/shared/forms/patientIntakeSchema'

const {
  patientData,
  currentStep,
  isProcessing,
  isStepComplete,
  nextStep,
  previousStep,
  completeStep,
  error
} = useWorkflowState()

const isSubmitting = ref(false)

const steps = computed(() => 
  workflowSteps.value.map((step, index) => ({
    ...step,
    description: `Step ${index + 1}`,
    slot: `step-${index + 1}`
  }))
)

const defaultRpaUrl = 'https://forms.office.com/r/ADdwWc7QaL'
const defaultTaskDescription = `1. Click the "Start" button if present
2. Enter "%personalInfo.firstName% %personalInfo.lastName%" in the "Full Name" field
3. Enter "%contactInfo.email%" in the "Email" field
4. Enter "%contactInfo.phone%" in the "Phone Number" field
5. Enter "%personalInfo.dateOfBirth%" in the "Date of Birth" field
6. Select "%personalInfo.gender%" in the "Gender" dropdown if present
7. Enter "%contactInfo.address.street%, %contactInfo.address.city%, %contactInfo.address.state% %contactInfo.address.zipCode%" in the "Address" field
8. Enter "%insurance.provider%" in the "Insurance Provider" field
9. Enter "%insurance.policyNumber%" in the "Policy Number" field
10. Enter "%emergencyContact.name%" in the "Emergency Contact Name" field
11. Enter "%emergencyContact.phone%" in the "Emergency Contact Phone" field
12. Enter "%emergencyContact.relationship%" in the "Emergency Contact Relationship" field
13. Click the "Submit" button`

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 0:
      return patientData.value && Object.keys(patientData.value).length > 0
    case 1:
      return isStepComplete(1)
    default:
      return true
  }
})

function updatePatientData(data: any) {
  patientData.value = data
}

function handleNextStep() {
  if (canProceedToNextStep.value) {
    completeStep(currentStep.value)
    nextStep()
  }
}

function handleRpaSuccess() {
  completeStep(currentStep.value)
  nextStep()
}

function handleRpaError(errorMessage: string) {
  error.value = errorMessage
}

const workflowSteps = useState('workflowSteps', () => [
  {
    title: 'Doctor Referral',
    content: 'Doctor writes referral for patient to complete a home sleep study',
  },
  {
    title: 'Document Submission',
    content: 'Doctor faxes completed referral form(s), patient demographics, insurance information, and clinical notes',
  },
  {
    title: 'Patient Chart Creation',
    content: 'Intake team creates patient chart and sales orders',
    details: ['Pre-ordering of CHAP/DME possible for positive sleep apnea cases']
  },
  {
    title: 'Insurance Verification',
    content: 'Insurance benefits verification for out-of-pocket cost estimation',
    details: [
      'Based on network status',
      'Considers deductible and co-insurance'
    ]
  },
  {
    title: 'Scheduling Assignment',
    content: 'Sales order assigned to scheduling team after cost estimation and document receipt'
  },
  {
    title: 'Patient Scheduling',
    content: 'Scheduling team contacts patient for service scheduling and payment collection'
  },
  {
    title: 'Equipment Shipment',
    content: 'Equipment shipped to patient via UPS 2-day shipping'
  },
  {
    title: 'Virtual Setup',
    content: 'Patient has virtual tele-tech appointment with sleep coach for equipment setup'
  },
  {
    title: 'Test Completion',
    content: 'Patient completes test and returns equipment using provided shipping label'
  },
  {
    title: 'Data Processing',
    content: 'Coordinator uploads device data and creates diagnostic report'
  },
  {
    title: 'Medical Review',
    content: 'Certified sleep doctor interprets and signs report, then faxes to ordering doctor'
  },
  {
    title: 'Billing Process',
    content: 'Billing team files insurance claim and completes service order'
  }
])

const processNotes = [
  {
    label: 'WIP States',
    icon: 'i-lucide-list-todo',
    content: `Classification for sales orders that lets team know the status:
    • Missing Documents
    • Pending Insurance Verification
    • Ready to Schedule
    • Pending Follow-Up
    Used to organize and track order progress through the workflow.`
  },
  {
    label: 'Sales Orders',
    icon: 'i-lucide-clipboard-list',
    content: `• Order for specific service sent by doctor with billing/insurance code information
    • Gets billed to insurance once completed
    • Types: CHST, CHST/WST, CHAP, DME
    • Rental Device Sales Order: Created for CHST or CHAP scheduling, used for shipping tracking only (not billed)`
  },
  {
    label: 'Work Lists & Organization',
    icon: 'i-lucide-list-checks',
    content: `• Sales Orders Work List: List of all sales orders by WIP state or employee assignment
    • Can be organized by Doctor for clinic updates
    • Used for scheduling and tracking missing documents
    • Patient Chart: Comprehensive record of patient information, orders, documents, and contact history`
  },
  {
    label: 'Scheduling System',
    icon: 'i-lucide-calendar',
    content: 'Scheduler: Color-coded calendar system for scheduling team to manage appointments for shipping team and sleep coaches'
  }
]

const services = [
  {
    title: 'Comprehensive Home Sleep Studies (CHST)',
    description: 'Diagnose sleep apnea by monitoring heart rate, breathing, and brain activity during sleep.',
    details: [
      '3 Night home sleep test (2 nights if not specified by doctor)',
      'Comprehensive monitoring of vital signs during sleep'
    ]
  },
  {
    title: 'Wakefulness Screening Tests (WST)',
    description: 'Determines somnolence (daytime sleepiness)',
    details: [
      '45-minute daytime test using CHST equipment',
      'Patient remains in isolated environment without distractions',
      'Monitors alertness/wakefulness during test period'
    ]
  },
  {
    title: 'Sleep Therapy (Auto-PAP/DME)',
    description: 'Positive Airway Pressure therapy equipment for nightly use to prevent sleep apnea.',
    details: [
      'CPAP: Single pressure setting throughout night',
      'APAP: Adaptive pressure range that adjusts automatically',
      'Includes machine, tubing, and mask/headgear'
    ]
  },
  {
    title: 'Comprehensive Home Auto PAP Test (CHAP)',
    description: 'Follow-up testing to verify effectiveness of APAP therapy.',
    details: [
      '3-night test using CHST equipment with APAP machine',
      'Performed after 2 weeks of machine use',
      'Validates pressure settings and mask effectiveness'
    ]
  }
]

// Mock data for UI
const schedulers = [
  { id: 1, name: 'John Smith', label: 'John Smith' },
  { id: 2, name: 'Sarah Johnson', label: 'Sarah Johnson' },
  { id: 3, name: 'Mike Williams', label: 'Mike Williams' }
]

const availableTimeSlots = [
  { id: '9am', label: '9:00 AM' },
  { id: '10am', label: '10:00 AM' },
  { id: '11am', label: '11:00 AM' },
  { id: '1pm', label: '1:00 PM' },
  { id: '2pm', label: '2:00 PM' },
  { id: '3pm', label: '3:00 PM' }
]

const priorityOptions = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' }
]

const paymentMethods = [
  { id: 'credit', label: 'Credit Card' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'cash', label: 'Cash' }
]

const testStatusOptions = [
  { id: 'completed', label: 'Completed' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'failed', label: 'Failed' }
]

const equipmentStatusOptions = [
  { id: 'pending', label: 'Pending' },
  { id: 'in_transit', label: 'In Transit' },
  { id: 'received', label: 'Received' }
]

// Form states
const selectedScheduler = ref(null)
const priority = ref('medium')
const schedulingNotes = ref('')
const appointmentDate = ref('')
const timeSlot = ref('')
const paymentMethod = ref('')
const appointmentNotes = ref('')
const meetingNotes = ref('')
const testStatus = ref('pending')
const equipmentStatus = ref('pending')
const testNotes = ref('')

// Scheduling state
const patientPhone = ref('')
const isCallLoading = ref(false)
const callStatus = ref('')
const SCHEDULING_ASSISTANT_ID = 'asst_sleep_study_scheduler'

const isValidPhoneNumber = computed(() => {
  return patientPhone.value.match(/^\+[1-9]\d{1,14}$/)
})

async function initiateCall() {
  if (!isValidPhoneNumber.value) return

  isCallLoading.value = true
  callStatus.value = 'initiating'
  error.value = ''

  try {
    const response = await fetch('/api/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: patientPhone.value,
        assistantId: SCHEDULING_ASSISTANT_ID
      })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to initiate call')
    }

    callStatus.value = 'connected'
    
    // Poll for call status
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/call/${result.callId}`)
        const statusResult = await statusResponse.json()
        
        if (statusResult.status === 'ended') {
          callStatus.value = 'ended'
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('Error polling call status:', err)
      }
    }, 5000)

    // Clear interval after 10 minutes to prevent indefinite polling
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 10 * 60 * 1000)

    useToast().add({
      title: 'Call Initiated',
      description: 'Connected to patient',
      icon: 'i-lucide-phone-outgoing',
      color: 'green'
    })
  } catch (err: any) {
    error.value = err.message
    callStatus.value = 'failed'
    useToast().add({
      title: 'Call Failed',
      description: err.message,
      icon: 'i-lucide-phone-off',
      color: 'red'
    })
  } finally {
    isCallLoading.value = false
  }
}

// RPA task configurations
const insuranceVerificationUrl = 'https://insurance-portal.example.com'
const insuranceVerificationSteps = `1. Log into the insurance portal
2. Enter patient policy number: "%insurance.policyNumber%"
3. Click "Verify Benefits"
4. Save verification results
5. Download EOB document`

const shippingSystemUrl = 'https://shipping.example.com'
const shippingSteps = `1. Create new shipment
2. Enter delivery address: "%contactInfo.address.street%, %contactInfo.address.city%, %contactInfo.address.state% %contactInfo.address.zipCode%"
3. Select "2-Day Shipping"
4. Generate shipping label
5. Schedule pickup`

const diagnosticSystemUrl = 'https://diagnostic.example.com'
const diagnosticSteps = `1. Upload device data
2. Generate diagnostic report
3. Save report to patient file
4. Create summary for doctor review`

const doctorPortalUrl = 'https://doctor-portal.example.com'
const doctorReviewSteps = `1. Upload diagnostic report
2. Assign to sleep doctor
3. Wait for signature
4. Send report to ordering doctor`

const billingSystemUrl = 'https://billing.example.com'
const billingSteps = `1. Create insurance claim
2. Attach all required documentation
3. Submit claim
4. Generate invoice
5. Update service order status`

// UI handlers
function handleAssignScheduler() {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    handleRpaSuccess()
  }, 1000)
}

function handleScheduleAppointment() {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    handleRpaSuccess()
  }, 1000)
}

function joinMeeting() {
  window.open('https://meet.example.com/sleep-study', '_blank')
}

function completeMeeting() {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    handleRpaSuccess()
  }, 1000)
}

function completeTest() {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    handleRpaSuccess()
  }, 1000)
}
</script>

<style scoped>
.prose ul {
  @apply list-disc list-inside;
}
</style>
