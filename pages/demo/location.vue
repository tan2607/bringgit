<!-- Location Search Demo -->
<script setup lang="ts">
import { ClinicWithDistance } from '~/types/clinic'

const config = useRuntimeConfig()
const searchForm = reactive({
  searchQuery: ''
})
const loading = ref(false)
const nearestClinics = ref<ClinicWithDistance[]>([])
const error = ref('')

// Generate static map URL for a clinic
const getStaticMapUrl = (clinic: ClinicWithDistance) => {
  const params = new URLSearchParams({
    center: `${clinic.lat},${clinic.lon}`,
    zoom: '15',
    size: '200x200',
    markers: `color:red|${clinic.lat},${clinic.lon}`,
    key: config.public.googleApiKey,
  })
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
}

// Search for nearest clinics
const searchClinics = async () => {
  if (!searchForm.searchQuery) {
    error.value = 'Please enter a location'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data: response } = await useFetch('/api/clinics/nearest', {
      query: {
        searchQuery: searchForm.searchQuery
      }
    })

    if (response.value?.success) {
      nearestClinics.value = response.value.data
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

    <div class="border rounded-lg p-4 mb-6 flex items-start gap-3 bg-green-50 dark:bg-green-950">
      <UIcon name="i-lucide-info" class="size-5 flex-shrink-0 mt-0.5" />
      <p class="text-sm">Enter a location in Singapore to find the nearest clinics to your location. The results will show you the three closest clinics and their distances.</p>
    </div>

    <!-- Search Form -->
    <UForm 
      :state="searchForm"
      class="flex gap-4 items-start mb-6"
      @submit="searchClinics"
    >
      <div class="flex-1">
        <UInput
          class="w-full"
          v-model="searchForm.searchQuery"
          placeholder="Enter location (e.g., Orchard Road, Tampines Mall, 238823)"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-lucide-map-pin" />
          </template>
        </UInput>
      </div>

      <UButton
        type="submit"
        color="primary"
        :loading="loading"
        :disabled="loading"
        size="lg"
      >
        <template #leading>
          <UIcon name="i-lucide-search" />
        </template>
        Search
      </UButton>
    </UForm>

    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      icon="i-lucide-alert-circle"
      class="mb-6"
    >
      {{ error }}
    </UAlert>

    <!-- Results -->
    <div v-if="nearestClinics.length > 0" class="space-y-6 mt-6">
      <div class="grid gap-6">
        <UCard
          v-for="(clinic, index) in nearestClinics.slice(0, 3)"
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

          <div class="flex gap-4">
            <div class="flex-1 space-y-2">
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

            <!-- Static Map Image -->
            <img 
              :src="getStaticMapUrl(clinic)"
              :alt="`Map showing location of ${clinic.name}`"
              class="w-[200px] h-[200px] rounded-lg object-cover flex-shrink-0"
              loading="lazy"
            />
          </div>
        </UCard>
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
</style>
