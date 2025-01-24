import type { Assistant } from '~/types/assistant'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

async function attachMeta(assistant: Assistant) {
  if (assistant.prompt?.startsWith('---')) {
    const { data } = await parseMarkdown(assistant?.prompt)
    assistant.meta = data
  }

  return assistant
}

export const useAssistants = () => {
  const assistants = useState<Assistant[]>('assistants', () => [])
  const selectedAssistant = useState<Assistant | null>('selectedAssistant', () => null)
  const isLoading = useState('assistantsIsLoading', () => false)

  const fetchAssistants = async () => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/assistants')
      assistants.value = (await Promise.all(data.value!.map(attachMeta))).filter(Boolean)
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
