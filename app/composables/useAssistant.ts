import { Vapi } from '@vapi-ai/server-sdk'
import type { Assistant } from '@@/types/assistant'

interface AssistantTemplate {
  id: string
  icon: string
  avatar: {
    name: string
    src: string
  }
  template: {
    firstMessage: string
    systemPrompt: string
    model?: {
      provider: 'openai'
      model: Vapi.OpenAiModelModel
      temperature?: number
      maxTokens?: number
      semanticCachingEnabled?: boolean
      emotionRecognitionEnabled?: boolean
      numFastTurns?: number
    }
  }
}

export const assistantTemplates: AssistantTemplate[] = [
  {
    id: 'blank-template',
    icon: 'i-lucide-file-plus',
    avatar: { name: 'Custom', src: '' },
    template: {
      firstMessage: 'Hello! How can I assist you today?',
      systemPrompt: 'You are a helpful AI assistant.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0,
        maxTokens: 250
      }
    }
  },
  {
    id: 'patient-triage',
    icon: 'i-lucide-stethoscope',
    avatar: { name: 'Sarah', src: '' },
    template: {
      firstMessage: 'Hello! I\'m Sarah, your medical triage assistant. How can I help you today?',
      systemPrompt: 'You are Sarah, a medical triage assistant. Help patients assess their symptoms and determine the urgency of their medical needs. Always be empathetic and professional. For serious medical conditions, advise seeking immediate medical attention.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 300
      }
    }
  },
  {
    id: 'appointment-scheduler',
    icon: 'i-lucide-calendar-clock',
    avatar: { name: 'Alex', src: '' },
    template: {
      firstMessage: 'Hi! I\'m Alex, your appointment scheduling assistant. Would you like to schedule, modify, or cancel an appointment?',
      systemPrompt: 'You are Alex, an appointment scheduling assistant. Help users schedule, modify, or cancel medical appointments. Be efficient and clear in your communication. Always confirm appointment details and provide a summary.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.2,
        maxTokens: 200
      }
    }
  },
  {
    id: 'nurse-assistant',
    icon: 'i-lucide-heart-pulse',
    avatar: { name: 'Emma', src: '' },
    template: {
      firstMessage: 'Hello! I\'m Emma, your nursing assistant. How may I help you today?',
      systemPrompt: 'You are Emma, a nursing assistant AI. Provide general healthcare information, post-care instructions, and medication reminders. Always emphasize following doctor\'s orders and direct medical questions to healthcare professionals.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.4,
        maxTokens: 300
      }
    }
  },
  {
    id: 'pharmacy-assistant',
    icon: 'i-lucide-pill',
    avatar: { name: 'Michael', src: '' },
    template: {
      firstMessage: 'Hi! I\'m Michael, your pharmacy assistant. How can I assist you with your medication needs?',
      systemPrompt: 'You are Michael, a pharmacy assistant AI. Help users understand their medications, potential side effects, and drug interactions. Always remind users to consult their pharmacist or doctor for specific medical advice.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 250
      }
    }
  },
  {
    id: 'medical-records',
    icon: 'i-lucide-clipboard-list',
    avatar: { name: 'David', src: '' },
    template: {
      firstMessage: 'Hello! I\'m David, your medical records assistant. How can I help you today?',
      systemPrompt: 'You are David, a medical records assistant AI. Help users access, understand, and manage their medical records. Maintain strict confidentiality and privacy. Direct users to proper channels for official record requests.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.1,
        maxTokens: 200
      }
    }
  }
]

export function useAssistant() {
  function getTemplateById(id: string): AssistantTemplate | undefined {
    return assistantTemplates.find(t => t.id === id)
  }

  function applyTemplate(assistant: Assistant, templateId: string): Assistant {
    const template = getTemplateById(templateId)
    if (template) {
      assistant.firstMessage = template.template.firstMessage
      assistant.model = {
        provider: template.template.model?.provider ?? 'openai',
        model: template.template.model?.model ?? 'gpt-4',
        temperature: template.template.model?.temperature ?? 0,
        maxTokens: template.template.model?.maxTokens ?? 250,
        messages: [
          {
            role: 'system',
            content: template.template.systemPrompt
          }
        ],
        semanticCachingEnabled: true,
        emotionRecognitionEnabled: false,
        numFastTurns: 0
      } as Vapi.OpenAiModel
    }
    return assistant
  }

  return {
    templates: assistantTemplates,
    getTemplateById,
    applyTemplate,
  }
}
