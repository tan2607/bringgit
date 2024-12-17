<!-- Location Search Demo -->
<script setup lang="ts">
import { ClinicWithDistance } from '~/types/clinic'

const config = useRuntimeConfig()
const mapRef = ref()
const isLoaded = ref(false)
const center = ref({ lat: 1.290270, lng: 103.851959 }) // Singapore center
const markers = ref<string[]>([])

// Form state
const searchForm = reactive({
  postalCode: ''
})
const loading = ref(false)
const nearestClinics = ref<ClinicWithDistance[]>([])
const error = ref('')

// Handle map ready event
function handleReady({ map }) {
  center.value = map.value.getCenter()
  map.value.addListener('center_changed', () => {
    center.value = map.value.getCenter()
  })
  isLoaded.value = true
}

// Update markers for clinics
const updateMarkers = (clinics: ClinicWithDistance[]) => {
  // Clear existing markers
  markers.value = []
  
  // Add new markers
  clinics.forEach(clinic => {
    markers.value.push(`${clinic.lat},${clinic.lon}`)
  })
}

// Search for nearest clinics
const searchClinics = async () => {
  if (!searchForm.postalCode) {
    error.value = 'Please enter a postal code'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data: response } = await useFetch('/api/clinics/nearest', {
      query: {
        postalCode: searchForm.postalCode
      }
    })

    if (response.value?.success) {
      nearestClinics.value = response.value.data
      updateMarkers(nearestClinics.value)
      
      // Update map center to first clinic
      if (nearestClinics.value.length > 0) {
        const firstClinic = nearestClinics.value[0]
        center.value = { lat: firstClinic.lat, lng: firstClinic.lon }
      }
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch nearest clinics'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer>
    <div class="flex justify-between items-center mb-6 mt-8">
      <h1 class="text-2xl font-bold">Find Nearest Clinics</h1>
    </div>

    <div class="border rounded-lg p-4 mb-6 flex items-start gap-3 bg-primary-50 dark:bg-primary-950">
      <UIcon name="i-lucide-info" class="size-5 flex-shrink-0 mt-0.5" />
      <p class="text-sm">Enter a Singapore postal code to find the nearest clinics to your location. The results will show you the three closest clinics and their distances.</p>
    </div>

    <!-- Search Form -->
    <div class="rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Search Location</h2>
      <UForm 
        :state="searchForm"
        class="space-y-4"
        @submit="searchClinics"
      >
        <UFormField
          label="Singapore Postal Code"
          name="postalCode"
          required
        >
          <UInput
            v-model="searchForm.postalCode"
            placeholder="Enter 6-digit postal code (e.g., 238823)"
          />
        </UFormField>

        <div class="flex items-center gap-4">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading"
          >
            <template #leading>
              <UIcon name="i-lucide-search" />
            </template>
            Find Nearest Clinics
          </UButton>

          <UAlert
            v-if="error"
            color="red"
            variant="soft"
            icon="i-lucide-alert-circle"
            class="flex-1"
          >
            {{ error }}
          </UAlert>
        </div>
      </UForm>
    </div>

    <!-- Results -->
    <div v-if="nearestClinics.length > 0" class="space-y-6">
      <!-- Map -->
      <div class="rounded-lg shadow-lg overflow-hidden not-prose">
        <div class="w-full h-[500px]">
          <ScriptGoogleMaps
            ref="mapRef"
            :center="center"
            :markers="markers"
            :api-key="config.public.googleApiKey"
            class="w-full h-full"
            above-the-fold
            @ready="handleReady"
          />
        </div>
        <UAlert 
          v-if="!isLoaded" 
          class="m-4" 
          size="sm" 
          color="blue" 
          variant="soft" 
          title="Static Image: Hover to load interactive" 
          description="Hovering the map will trigger the Google Maps script to load and init the map." 
        />
      </div>

      <!-- Clinic List -->
      <div class="rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Nearest Clinics</h2>
        <div class="grid gap-4">
          <UCard
            v-for="(clinic, index) in nearestClinics"
            :key="index"
            class="transition-all hover:shadow-lg"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <div class="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {{ index + 1 }}
                </div>
                <h3 class="text-lg font-semibold">
                  {{ clinic.name }}
                </h3>
              </div>
            </template>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="text-gray-500" />
                <p class="text-gray-600">
                  {{ clinic.distance.toFixed(2) }} km away
                </p>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-user" class="text-gray-500" />
                <p class="text-gray-600">
                  {{ clinic.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<style>
.marker-label {
  color: white;
  font-weight: bold;
  font-family: system-ui, -apple-system, sans-serif;
}

.gm-style-iw {
  padding: 0 !important;
}

.gm-style-iw-d {
  overflow: hidden !important;
}

.gm-style-iw-t::after {
  background: linear-gradient(45deg, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 51%, rgba(255,255,255,0) 100%) !important;
}
</style>
