<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Brightree API Test</h1>
    
    <UCard class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">WIP States Test</h2>
        </div>
      </template>
      
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <UCheckbox v-model="useMock" label="Use mock data" />
          <UButton 
            @click="testWIPStates" 
            :loading="loading" 
            :disabled="loading"
            color="primary"
          >
            Test WIP States
          </UButton>
        </div>
        
        <div v-if="error" class="mt-4">
          <UAlert 
            :title="error.title" 
            :description="error.message" 
            color="red" 
            variant="soft" 
            icon="i-heroicons-exclamation-triangle"
          />
        </div>
        
        <div v-if="wipStates.length > 0" class="mt-6">
          <h3 class="text-lg font-semibold mb-2">WIP States</h3>
          <UTable :columns="wipStateColumns" :rows="wipStates">
            <template #brightreeId-data="{ row }">
              {{ row.BrightreeID }}
            </template>
            <template #description-data="{ row }">
              {{ row.Description }}
            </template>
            <template #isActive-data="{ row }">
              <UBadge :color="row.IsActive ? 'green' : 'gray'">
                {{ row.IsActive ? 'Active' : 'Inactive' }}
              </UBadge>
            </template>
            <template #sortOrder-data="{ row }">
              {{ row.SortOrder }}
            </template>
          </UTable>
        </div>
      </div>
      
      <template #footer>
        <div class="text-sm text-gray-500">
          <p v-if="isMock" class="italic">Using mock data</p>
          <p v-else>Using real Brightree API</p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup>
// State management
const useMock = useState('brightree-use-mock', () => true)
const loading = useState('brightree-loading', () => false)
const error = useState('brightree-error', () => null)
const wipStates = useState('brightree-wip-states', () => [])
const isMock = useState('brightree-is-mock', () => false)

// Table columns for WIP states
const wipStateColumns = [
  {
    key: 'brightreeId',
    label: 'ID'
  },
  {
    key: 'description',
    label: 'Description'
  },
  {
    key: 'isActive',
    label: 'Status'
  },
  {
    key: 'sortOrder',
    label: 'Sort Order'
  }
]

/**
 * Test WIP states fetch
 */
async function testWIPStates() {
  loading.value = true
  error.value = null
  wipStates.value = []
  
  try {
    const response = await $fetch('/api/test-brightree', {
      method: 'POST',
      body: {
        useMock: useMock.value,
        testMethod: 'WIPStatesFetchAll'
      }
    })
    
    if (response.success) {
      wipStates.value = response.wipStates
      isMock.value = response.isMock || false
    } else {
      error.value = {
        title: 'Error',
        message: response.error || 'Failed to fetch WIP states'
      }
    }
  } catch (err) {
    error.value = {
      title: 'Error',
      message: err.message || 'An unexpected error occurred'
    }
  } finally {
    loading.value = false
  }
}
</script>
