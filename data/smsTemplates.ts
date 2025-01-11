interface SmsTemplate {
  id: string
  category: string
  title: string
  message: string
  description?: string
}

export interface AiTemplateRequest {
  purpose: string
  language?: string
  tone?: 'professional' | 'friendly' | 'urgent' | 'casual'
  maxLength?: number
}

export interface SmsSuccessResponse {
  success: true
  message: string
  messageId: string
  status: string
  details: {
    to: string
    message: string
    timestamp: string
  }
}

export interface SmsErrorResponse {
  success: false
  message: string
  details: {
    error: string
    timestamp: string
  }
}

export type SmsResponse = SmsSuccessResponse | SmsErrorResponse

export const smsTemplates: SmsTemplate[] = [
  {
    id: 'appointment-reminder',
    category: 'Appointment Scheduling',
    title: 'Appointment Reminder',
    message: 'Hi [name], reminder: Your appointment with [doctor] is scheduled for [date] at [time]. Reply Y to confirm or R to reschedule. [clinic_name]',
    description: 'Professional appointment reminder with confirmation options'
  },
  {
    id: 'appointment-confirmation',
    category: 'Appointment Scheduling',
    title: 'Appointment Confirmed',
    message: 'Thank you for confirming your appointment on [date] at [time]. Please arrive 10 mins early. Location: [address]. Questions? Call [phone]',
    description: 'Appointment confirmation with instructions'
  },
  {
    id: 'medication-reminder',
    category: 'Medication Adherence',
    title: 'Medication Reminder',
    message: 'Time for your [time] [medication]. Take with food and water. Reply TAKEN when complete. Stay healthy!',
    description: 'Friendly medication reminder with confirmation'
  },
  {
    id: 'medication-refill',
    category: 'Medication Adherence',
    title: 'Refill Reminder',
    message: 'Your [medication] refill is due. [days] days of medication remaining. Reply REFILL to order or call [phone].',
    description: 'Medication refill alert'
  },
  {
    id: 'post-treatment',
    category: 'Post-Treatment Follow-Up',
    title: 'Post-Treatment Check',
    message: 'Hi [name], how are you feeling after [procedure]? Rate your comfort (1-poor to 5-excellent). Need assistance? Reply HELP for immediate support.',
    description: 'Detailed follow-up with rating system'
  },
  {
    id: 'health-education',
    category: 'Health Education',
    title: 'Health Tips',
    message: 'Health Tip: [tip_title]. [tip_content]. Learn more: [link]. Reply STOP to unsubscribe.',
    description: 'Educational health content'
  },
  {
    id: 'vaccination-reminder',
    category: 'Health Education',
    title: 'Vaccination Due',
    message: 'Your [vaccine_type] vaccination is due. Book your appointment: [link]. Questions? Call [phone].',
    description: 'Vaccination schedule reminder'
  },
  {
    id: 'chronic-disease',
    category: 'Disease Management',
    title: 'Health Monitoring',
    message: 'Daily health check: Please log your [metric] reading. Last reading: [previous]. Reply with current reading or call [phone] for support.',
    description: 'Regular health monitoring'
  },
  {
    id: 'payment-reminder',
    category: 'Billing',
    title: 'Payment Due',
    message: 'Payment of $[amount] for [service] is due [date]. Pay securely: [link]. Questions? Reply HELP.',
    description: 'Payment reminder with secure link'
  },
  {
    id: 'payment-confirmation',
    category: 'Billing',
    title: 'Payment Received',
    message: 'Thank you! Payment of $[amount] received for [service]. Reference: [ref]. Receipt: [link]',
    description: 'Payment confirmation with receipt'
  },
  {
    id: 'emergency-alert',
    category: 'Emergency',
    title: 'Emergency Notice',
    message: 'URGENT: [clinic_name] - [emergency_message]. Updates: [link]. Emergency: [emergency_phone]',
    description: 'Emergency notification'
  },
  {
    id: 'lab-results',
    category: 'Results',
    title: 'Results Ready',
    message: 'Your [test_type] results are ready. View securely: [link]. Questions? Schedule consultation: [phone]',
    description: 'Test results notification'
  }
]

export const categories = [...new Set(smsTemplates.map(t => t.category))]

export const getTemplateIcon = (category: string): string => {
  switch (category) {
    case 'Appointment Scheduling':
      return 'i-lucide-calendar'
    case 'Medication Adherence':
      return 'i-lucide-pill'
    case 'Post-Treatment Follow-Up':
      return 'i-lucide-stethoscope'
    case 'Health Education':
      return 'i-lucide-graduation-cap'
    case 'Disease Management':
      return 'i-lucide-activity'
    case 'Billing':
      return 'i-lucide-credit-card'
    case 'Emergency':
      return 'i-lucide-alert-triangle'
    case 'Results':
      return 'i-lucide-file-text'
    default:
      return 'i-lucide-message-square'
  }
}

export const getTemplateColor = (category: string): 'error' | 'warning' | 'info' | 'success' | 'primary' => {
  switch (category) {
    case 'Emergency':
      return 'error'
    case 'Billing':
      return 'warning'
    case 'Health Education':
      return 'info'
    case 'Disease Management':
      return 'success'
    default:
      return 'primary'
  }
}

export const generateAiTemplate = async (request: AiTemplateRequest): Promise<SmsTemplate> => {
  // Validate max length
  const maxLength = request.maxLength || 160 // Default SMS length
  
  const response = await $fetch('/api/sms/generate', {
    method: 'POST',
    body: {
      purpose: request.purpose,
      language: request.language || 'en',
      tone: request.tone || 'professional',
      maxLength
    }
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to generate template')
  }

  // Determine category based on purpose
  const categoryKeywords = {
    appointment: 'Appointment Scheduling',
    medication: 'Medication Adherence',
    treatment: 'Post-Treatment Follow-Up',
    education: 'Health Education',
    payment: 'Billing',
    emergency: 'Emergency',
    results: 'Results',
    default: 'General'
  }

  const category = Object.entries(categoryKeywords)
    .find(([key]) => request.purpose.toLowerCase().includes(key))
    ?.[1] || categoryKeywords.default

  return {
    id: `ai-${Date.now()}`,
    category,
    title: `AI: ${request.purpose.slice(0, 30)}${request.purpose.length > 30 ? '...' : ''}`,
    message: response.template,
    description: `${request.purpose} (${request.tone || 'professional'} tone)`
  }
}
