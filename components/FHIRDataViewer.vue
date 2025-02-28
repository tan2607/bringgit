<template>
  <div>
    <UCard v-if="fhirData" class="mb-4">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-activity" class="text-primary" />
          <h3 class="text-lg font-medium">FHIR Data Structure</h3>
        </div>
      </template>

      <UAccordion :items="fhirResources" color="primary">
        <template #item="{ item }">
          <div class="p-2">
            <pre class="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-80">{{ JSON.stringify(item.resource, null, 2) }}</pre>
          </div>
        </template>
      </UAccordion>
    </UCard>

    <div v-else class="text-sm text-gray-500 italic">
      No FHIR data available. Upload documents to extract healthcare information in FHIR format.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  fhirData: {
    type: Object,
    default: null
  }
})

// Process FHIR Bundle entries into accordion items
const fhirResources = computed(() => {
  if (!props.fhirData || !props.fhirData.entry) {
    return []
  }

  return props.fhirData.entry.map((entry, index) => {
    const resource = entry.resource
    return {
      id: resource.id || `resource-${index}`,
      label: `${resource.resourceType}: ${getResourceLabel(resource)}`,
      resource: resource,
      icon: getResourceIcon(resource.resourceType)
    }
  })
})

// Helper function to get a human-readable label for each resource
function getResourceLabel(resource) {
  switch (resource.resourceType) {
    case 'Patient':
      return resource.name?.[0]?.text || 'Unknown Patient'
    case 'Practitioner':
      return resource.name?.[0]?.text || 'Unknown Provider'
    case 'Appointment':
      return resource.description || `Appointment on ${resource.start?.substring(0, 10) || 'unknown date'}`
    case 'Coverage':
      return resource.payor?.[0]?.display || 'Unknown Insurance'
    case 'Condition':
      return resource.code?.text || 'Unknown Condition'
    default:
      return resource.id || 'Unknown Resource'
  }
}

// Helper function to get an appropriate icon for each resource type
function getResourceIcon(resourceType) {
  switch (resourceType) {
    case 'Patient':
      return 'i-lucide-user'
    case 'Practitioner':
      return 'i-lucide-stethoscope'
    case 'Appointment':
      return 'i-lucide-calendar'
    case 'Coverage':
      return 'i-lucide-credit-card'
    case 'Condition':
      return 'i-lucide-activity'
    default:
      return 'i-lucide-file'
  }
}
</script>
