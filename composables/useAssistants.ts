export const useAssistants = () => {
  const assistants = useState('assistants', () => [])
  const selectedAssistant = useState('selectedAssistant', () => null)
  const isLoading = useState('assistantsIsLoading', () => false)

  const fetchAssistants = async () => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/assistants')
      assistants.value = data.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    assistants,
    selectedAssistant,
    isLoading,
    fetchAssistants,
  }
}
