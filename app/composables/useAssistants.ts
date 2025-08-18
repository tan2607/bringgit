import type { Assistant } from '@@/types/assistant'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

async function attachMeta(assistant: Assistant) {
  if (assistant.prompt?.startsWith('---')) {
    try {
      const { data } = await parseMarkdown(assistant?.prompt)
      assistant.meta = data
    } catch (e) {
      const safe = safePrompt(assistant?.prompt);
      const { data } = await parseMarkdown(safe);
      
      assistant.meta = data;
    }
  }

  return assistant
}

function safePrompt(prompt: string) {
  if (!prompt.startsWith('---')) return prompt;

  return prompt.replace(
    /^---([\s\S]*?)---/,
    (m, fm) =>
      `---${fm.replace(/: (.*{{.*}}.*)/g, (_, v) => `: '${v.replace(/'/g, "''")}'`)}---`
  );
}

export const useAssistants = () => {
  const assistants = useState<Assistant[]>('assistants', () => [])
  const selectedAssistant = useState<Assistant | null>('selectedAssistant', () => null)
  const isLoading = useState('assistantsIsLoading', () => false)

  const fetchAssistants = async () => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/assistants', {
        deep: true
      })
      assistants.value = (await Promise.all(data.value!.map(attachMeta))).filter(Boolean)
      return assistants.value;
    }finally {
      isLoading.value = false
    }
  }

  const getAssistantById = (id: string) => {
    return assistants.value.find((assistant) => assistant.id === id)
  }

  return {
    assistants,
    selectedAssistant,
    isLoading,
    fetchAssistants,
    getAssistantById
  }
}
