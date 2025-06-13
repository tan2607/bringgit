<template>
  <USelect
    v-model="selectedNumber"
    :items="numbers.map(number => ({ value: number.id, label: `${number.number} (${number.name})` }))"
    :loading="isLoading"
    class="flex-1 max-w-xs"
    placeholder="Select Phone Number"
    option-attribute="name"
    value-attribute="id"
    required
    multiple
  >
    <template #leading>
      <UIcon :name="isLoading ? 'i-lucide-loader-2' : 'i-lucide-phone'" :class="{ 'animate-spin': isLoading }" />
    </template>
  </USelect>
</template>

<script setup lang="ts">
interface PhoneNumber {
  id: string
  name: string
  number: string
  provider?: string
  status?: 'active' | 'inactive'
}

const toast = useToast()
const selectedNumber = defineModel<string>('2afa0400-d1a1-4ca9-9102-f1aa5f50f766')
const { numbers, isLoading, fetchNumbers } = usePhoneNumbers()

// Only fetch on mount if numbers are empty
onMounted(() => {
  if (!numbers.value.length) {
    fetchNumbers()
  }
})
</script>
