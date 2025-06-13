import type { Assistant } from '@@/types'

export const useAssistantState = () => {
  const currentAssistant = useState<Assistant | null>('currentAssistant', () => null)
  const isTestMode = useState<boolean>('assistantTestMode', () => false)
  const activeTab = useState<string>('assistantActiveTab', () => 'agent')

  const setAssistant = (assistant: Assistant | null) => {
    currentAssistant.value = assistant
  }

  const resetState = () => {
    currentAssistant.value = null
    isTestMode.value = false
    activeTab.value = 'agent'
  }

  return {
    currentAssistant,
    isTestMode,
    activeTab,
    setAssistant,
    resetState
  }
}
