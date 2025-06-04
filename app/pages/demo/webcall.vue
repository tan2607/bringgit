<template>
    <UContainer class="py-8">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-message-square" class="text-primary" />
                        <h1 class="text-xl font-semibold">Web Call Interface</h1>
                    </div>
                </div>
            </template>

            <UStepper ref="stepper" :items="steps" class="w-full">
                <!-- Upload Documents Step -->
                <template #upload>
                    <div class="p-4">
                        <CallDocumentUpload @update:extractedVariables="updateVariables"
                            :onComplete="handleDocumentProcessingComplete" />
                    </div>
                </template>

                <!-- Edit Variables Step -->
                <template #variables>
                    <div class="p-4">
                        <div class="mb-8">
                            <UFormField label="Agent Name">
                                <UInput v-model="editableVariables.agent.name" />
                            </UFormField>
                            <UFormField label="Coach Name">
                                <UInput v-model="editableVariables.coach.name" />
                            </UFormField>
                            <UFormField label="Patient Name">
                                <UInput v-model="editableVariables.patient.name" />
                            </UFormField>
                            <UFormField label="Patient Condition">
                                <UInput v-model="editableVariables.patient.condition" />
                            </UFormField>
                            <UFormField label="Patient Address">
                                <UInput v-model="editableVariables.patient.address" />
                            </UFormField>
                            <UFormField label="Last Visit">
                                <UInput v-model="editableVariables.patient.lastVisit" />
                            </UFormField>
                            <UFormField label="Doctor Name">
                                <UInput v-model="editableVariables.doctor.name" />
                            </UFormField>
                            <UFormField label="Appointment Date">
                                <UInput v-model="editableVariables.appointment.date" />
                            </UFormField>
                            <UFormField label="Morning Slot">
                                <UInput v-model="editableVariables.appointment.morningSlot" />
                            </UFormField>
                            <UFormField label="Afternoon Slot">
                                <UInput v-model="editableVariables.appointment.afternoonSlot" />
                            </UFormField>

                            <!-- Add appointment availability component -->
                            <div class="col-span-full mt-4" v-if="appointmentAvailabilityData.length > 0">
                                <h3 class="text-lg font-semibold mb-2">Select Appointment Time</h3>
                                <AppointmentAvailability :availabilityData="appointmentAvailabilityData"
                                    @update:selectedDate="updateSelectedDate"
                                    @update:selectedTime="updateSelectedTime" />
                            </div>
                            <UFormField label="Hours Start">
                                <UInput v-model="editableVariables.business.hoursStart" />
                            </UFormField>
                            <UFormField label="Hours End">
                                <UInput v-model="editableVariables.business.hoursEnd" />
                            </UFormField>
                            <UFormField label="Timezone">
                                <UInput v-model="editableVariables.business.timezone" />
                            </UFormField>
                            <UFormField label="Test Name">
                                <UInput v-model="editableVariables.test.name" />
                            </UFormField>
                            <UFormField label="Test Duration">
                                <UInput v-model="editableVariables.test.duration" />
                            </UFormField>
                            <UFormField label="Insurance Name">
                                <UInput v-model="editableVariables.payment.insuranceName" />
                            </UFormField>
                            <UFormField label="Insurance Coverage">
                                <UInput v-model="editableVariables.payment.insuranceCoverage" />
                            </UFormField>
                            <UFormField label="Insurance Price">
                                <UInput v-model="editableVariables.payment.insurancePrice" />
                            </UFormField>
                            <UFormField label="Cash Price">
                                <UInput v-model="editableVariables.payment.cashPrice" />
                            </UFormField>
                            <UFormField label="Min Down Payment">
                                <UInput v-model="editableVariables.payment.minDownPayment" />
                            </UFormField>
                            <UFormField label="Remaining Amount">
                                <UInput v-model="editableVariables.payment.remainingAmount" />
                            </UFormField>
                            <UFormField label="Second Installment">
                                <UInput v-model="editableVariables.payment.secondInstallment" />
                            </UFormField>
                            <UFormField label="Cancellation Fee">
                                <UInput v-model="editableVariables.payment.cancellationFee" />
                            </UFormField>
                            <UFormField label="Accepted Methods">
                                <UInput v-model="editableVariables.payment.acceptedMethods" />
                            </UFormField>
                            <UFormField label="Max Installments">
                                <UInput v-model="editableVariables.payment.maxInstallments" />
                            </UFormField>

                        </div>
                    </div>
                </template>

                <!-- Start Call Step -->
                <template #call>
                    <div class="p-4">
                        <CallTask 
                            :variables="editableVariables" 
                            :assistant-id="VAPI_ASSISTANT_ID" 
                        />
                    </div>
                </template>
            </UStepper>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, computed } from 'vue'
import { useRoute } from '#imports'
import { defaultCallVariables } from '~/server/utils/variableSchema'

// Import components
import AppointmentAvailability from '~/components/AppointmentAvailability.vue'
import CallTask from '~/components/CallTask.vue'

const route = useRoute()
const stepper = ref()

// VAPI configuration
const VAPI_ASSISTANT_ID = "271b3b9b-94aa-4a09-800b-5f8ee7e31d21";


// Define steps for the stepper
const steps = [
    {
        slot: 'upload',
        title: 'Upload Documents',
        description: 'Upload and process documents',
        icon: 'i-heroicons-document-arrow-up'
    },
    {
        slot: 'variables',
        title: 'Edit Variables',
        description: 'Review and edit extracted variables',
        icon: 'i-heroicons-variable'
    },
    {
        slot: 'call',
        title: 'Start Call',
        description: 'Initiate call with virtual assistant',
        icon: 'i-heroicons-phone'
    }
]

// Set the initial step based on the URL query parameter
const tabParam = computed(() => route.query.tab?.toString())
watch(tabParam, (newTab) => {
    if (newTab && stepper.value) {
        const stepIndex = steps.findIndex(step => step.slot === newTab)
        if (stepIndex !== -1) {
            stepper.value.next()
        }
    }
}, { immediate: true })

// Define the accordion items for variable categories
const accordionItems = [
    {
        key: 'personnel',
        label: 'Personnel',
        icon: 'i-heroicons-user-group',
        defaultOpen: true
    },
    {
        key: 'patient',
        label: 'Patient Information',
        icon: 'i-heroicons-user',
        defaultOpen: true
    },
    {
        key: 'doctor',
        label: 'Doctor Information',
        icon: 'i-heroicons-user-circle',
        defaultOpen: true
    },
    {
        key: 'sleepCoach',
        label: 'Sleep Coach',
        icon: 'i-heroicons-academic-cap',
        defaultOpen: true
    },
    {
        key: 'appointment',
        label: 'Appointment Details',
        icon: 'i-heroicons-calendar',
        defaultOpen: true
    },
    {
        key: 'business',
        label: 'Business Information',
        icon: 'i-heroicons-building-office',
        defaultOpen: true
    },
    {
        key: 'test',
        label: 'Test Information',
        icon: 'i-heroicons-beaker',
        defaultOpen: true
    },
    {
        key: 'payment',
        label: 'Payment Information',
        icon: 'i-heroicons-currency-dollar',
        defaultOpen: true
    }
]

// Store for appointment availability data
const appointmentAvailabilityData = ref([])

// Fetch appointment availability data from the server
async function fetchAppointmentAvailability() {
    try {
        const response = await $fetch('/api/brightree/availability')
        if (response.success && response.data) {
            appointmentAvailabilityData.value = response.data

            // Update the appointment date and slots based on the first available date
            if (appointmentAvailabilityData.value.length > 0) {
                const firstDate = appointmentAvailabilityData.value[0]
                editableVariables.value.appointment.date = firstDate.date

                // Set morning and afternoon slots if available
                const morningSlots = firstDate.availableTimes.filter(time => time.includes('AM'))
                const afternoonSlots = firstDate.availableTimes.filter(time => time.includes('PM'))

                if (morningSlots.length > 0) {
                    editableVariables.value.appointment.morningSlot = morningSlots[0]
                }

                if (afternoonSlots.length > 0) {
                    editableVariables.value.appointment.afternoonSlot = afternoonSlots[0]
                }
            }
        }
    } catch (error) {
        console.error('Error fetching appointment availability:', error)
    }
}

// Initialize appointment availability data
onMounted(() => {
    fetchAppointmentAvailability()
})

// Define default dynamic variables - use the centralized schema
const dynamicVariables = ref({ ...defaultCallVariables })

// Create a reactive copy for editing
const editableVariables = ref({ ...dynamicVariables.value })

// FHIR data storage
const fhirData = ref(null)

// Handle document extraction results
function updateVariables(extractedData) {
    console.log(extractedData)
    
    // Store FHIR data if available
    if (extractedData.fhirData) {
        fhirData.value = extractedData.fhirData
        console.log('FHIR data stored:', fhirData.value)
    }
    
    // Deep merge the extracted data with the existing variables
    if (extractedData.patient) {
        Object.assign(editableVariables.value.patient, extractedData.patient);
    }

    if (extractedData.doctor) {
        Object.assign(editableVariables.value.doctor, extractedData.doctor);
    }

    if (extractedData.appointment) {
        editableVariables.value.appointment.date = extractedData.appointment.date || editableVariables.value.appointment.date;

        // Handle available times if present
        if (extractedData.appointment.morningSlot) {
            editableVariables.value.appointment.morningSlot = extractedData.appointment.morningSlot || editableVariables.value.appointment.morningSlot;
        }
        
        if (extractedData.appointment.afternoonSlot) {
            editableVariables.value.appointment.afternoonSlot = extractedData.appointment.afternoonSlot || editableVariables.value.appointment.afternoonSlot;
        }
    }

    if (extractedData.payment) {
        Object.assign(editableVariables.value.payment, extractedData.payment);
    }

    // Store appointment availability data if present
    if (extractedData.availabilityData && extractedData.availabilityData.length > 0) {
        appointmentAvailabilityData.value = extractedData.availabilityData;
    } else if (appointmentAvailabilityData.value.length === 0) {
        // If no availability data was provided, fetch from server
        fetchAppointmentAvailability();
    }

    // Create computed values if needed
    if (extractedData.payment?.insurancePrice && !extractedData.payment.minDownPayment) {
        // Example: minDownPayment is calculated as 50% of insurancePrice
        const price = parseFloat(extractedData.payment.insurancePrice.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(price)) {
            editableVariables.value.payment.minDownPayment = `$${Math.round(price * 0.5)}`;
        }
    }
}

// Handle completion of document processing
function handleDocumentProcessingComplete(data) {
    // Fetch appointment availability data from server if none exists
    if (appointmentAvailabilityData.value.length === 0) {
        fetchAppointmentAvailability();
    }

    // Automatically move to the variables tab after processing
    if (stepper.value) {
        const variablesIndex = steps.findIndex(step => step.slot === 'variables')
        if (variablesIndex !== -1) {
            stepper.value.next()
        }
    }
}

// Update appointment date and time when selected from the availability component
function updateSelectedDate(date) {
    editableVariables.value.appointment.date = date;
}

function updateSelectedTime(time) {
    // Determine if this is a morning or afternoon slot based on time
    const hour = parseInt(time.split(':')[0]);
    const isPM = time.toLowerCase().includes('pm');

    if ((hour < 12 && !isPM) || (hour === 12 && !isPM)) {
        // Morning slot
        editableVariables.value.appointment.morningSlot = time;
    } else {
        // Afternoon slot
        editableVariables.value.appointment.afternoonSlot = time;
    }
}


</script>

<style scoped></style>