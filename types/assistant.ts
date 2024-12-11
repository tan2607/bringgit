import { Vapi } from '@vapi-ai/server-sdk'

export interface Criterion {
  id: string
  name: string
  prompt: string
}

export interface DataItem {
  id: string
  identifier: string
  type: string
  description: string
}

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
]

export const llmOptions = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-2', label: 'Claude 2' },
]

export const defaultAssistant: Vapi.Assistant = {
  id: '',
  orgId: '',
  name: '',
  firstMessage: 'Hello! How can I assist you today?',
  firstMessageMode: 'assistant-speaks-first',
  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0,
    maxTokens: 250,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant.'
      }
    ],
    semanticCachingEnabled: true,
    emotionRecognitionEnabled: false,
    numFastTurns: 0
  } as Vapi.OpenAiModel,
  hipaaEnabled: false,
  backgroundDenoisingEnabled: true,
  modelOutputInMessagesEnabled: true,
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 600,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
