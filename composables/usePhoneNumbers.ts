export interface PhoneNumber {
  id: string
  name: string
  number: string
  provider?: string
  status?: 'active' | 'inactive'
}

export const usePhoneNumbers = () => {
  const numbers = useState<PhoneNumber[]>('phone-numbers', () => [])
  const isLoading = ref(false)
  const lastFetchTime = useState<number>('phone-numbers-last-fetch', () => 0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const fetchNumbers = async (force = false) => {
    // Return cached data if within cache duration
    if (!force && numbers.value.length > 0 && Date.now() - lastFetchTime.value < CACHE_DURATION) {
      return numbers.value
    }

    if (isLoading.value) return numbers.value
    
    try {
      isLoading.value = true
      const { success, numbers: fetchedNumbers } = await $fetch<{ success: boolean, numbers: PhoneNumber[] }>('/api/numbers')
      
      if (success) {
        numbers.value = fetchedNumbers.filter(n => n.status !== 'inactive')
        lastFetchTime.value = Date.now()
      } else {
        throw new Error('Failed to fetch phone numbers')
      }
    } catch (error) {
      console.error('Error fetching numbers:', error)
      const toast = useToast()
      toast.add({
        id: 'fetch-numbers-error',
        title: 'Error',
        description: 'Failed to load phone numbers. Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    } finally {
      isLoading.value = false
    }

    return numbers.value
  }

  // Initial fetch on app start
  if (process.client && !numbers.value.length) {
    fetchNumbers()
  }

  const getPhoneNumberById = (id: string): PhoneNumber | undefined => {
    return numbers.value.find(number => number.id === id)
  }

  return {
    numbers,
    isLoading,
    fetchNumbers,
    getPhoneNumberById
  }
}
