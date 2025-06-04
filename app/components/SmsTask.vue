<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-message-square" class="text-primary" />
          <h3 class="font-medium">SMS Sender</h3>
        </div>


        <!-- Help Documentation Modal -->
        <USlideover v-model="helpModal">

          <UButton variant="ghost" color="neutral" icon="i-lucide-help-circle" size="sm"
            class="text-sm flex items-center gap-1" @click="helpModal = true">
            Help
          </UButton>
          <template #content>

            <UCard class="w-full overflow-auto">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-book-open" class="text-primary" />
                    <h3 class="font-medium">SMS Messaging</h3>
                  </div>
                </div>
              </template>
              <ContentRenderer :value="helpContent" class="prose dark:prose-invert max-w-none" />
            </UCard>
          </template>
        </USlideover>
      </div>
    </template>

    <div class="space-y-4">
      <UFormField label="To Number" required>
        <div class="flex gap-2">
          <USelect v-model="formState.countryCode" :items="countryCodes" placeholder="Select Country" class="w-50" />
          <UInput v-model="formState.phoneNumber" placeholder="12345678" type="tel" icon="i-lucide-phone" />
        </div>
      </UFormField>

      <UFormField label="Message" required>
        <UModal :open="templateModal">
          <UButton color="primary" size="sm" variant="soft" class="mb-2" @click="templateModal = true">
            Select Template
          </UButton>
          <template #content>
            <UCard class="overflow-y-auto">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-book-template" class="text-primary" />
                    <h3 class="font-medium">SMS Templates</h3>
                  </div>
                </div>
              </template>

              <div class="space-y-4">
                <!-- AI Generation Section -->
                <UCard>
                  <UCollapsible>
                    <UButton block color="primary" variant="ghost" class="justify-between">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-sparkles" />
                        <span>SMS Template Generator</span>
                      </div>
                      <UIcon name="i-lucide-chevron-down" />
                    </UButton>

                    <template #content>
                      <div class="space-y-4 pt-4">
                        <UForm @submit="generateTemplate" :state="generateAiTemplateState">
                          <div class="space-y-4">
                            <UFormField label="Purpose" required>
                              <UTextarea required v-model="aiForm.purpose" class="w-full" autoresize :rows="2"
                                placeholder="Describe what you want to communicate..." />
                            </UFormField>
                            <div class="grid grid-cols-2 gap-4">
                              <UFormField label="Language">
                                <USelect v-model="aiForm.language" :items="languages" placeholder="Select language"
                                  icon="i-lucide-languages" />
                              </UFormField>
                              <UFormField label="Tone">
                                <USelect v-model="aiForm.tone" :items="tones" placeholder="Select tone"
                                  icon="i-lucide-message-square" />
                              </UFormField>
                            </div>
                            <UFormField label="Max Length">
                              <div class="flex items-center gap-2">
                                <USlider v-model="aiForm.maxLength" :min="50" :max="320" :step="10" class="flex-1" />
                                <span class="text-sm text-gray-500 w-16 text-right">
                                  {{ aiForm.maxLength }} chars
                                </span>
                              </div>
                            </UFormField>
                            <div class="flex justify-end">
                              <UButton type="submit" color="primary" :loading="isGenerating" icon="i-lucide-sparkles">
                                Generate
                              </UButton>
                            </div>
                          </div>
                        </UForm>
                      </div>
                    </template>
                  </UCollapsible>
                </UCard>

                <USeparator label="Or choose from templates" />

                <div class="flex gap-2">
                  <USelect v-model="selectedCategory"
                    :items="[{ label: 'All Categories', value: 'All' }, ...categories.map(c => ({ label: c, value: c }))]"
                    placeholder="Filter by category" class="flex-1" />
                  <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search templates..."
                    class="flex-1" />
                </div>

                <div class="grid grid-cols-1 gap-4 overflow-auto max-h-[60vh] p-4">
                  <UCard v-for="template in filteredTemplates" :key="template.id" @click="selectTemplate(template)">
                    <template #header>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <UIcon :name="getTemplateIcon(template.category)" class="text-primary" />
                          <h4 class="font-medium text-sm">{{ template.title }}</h4>
                        </div>
                        <UBadge :color="getTemplateColor(template.category)" variant="subtle" size="sm">
                          {{ template.category }}
                        </UBadge>
                      </div>
                    </template>

                    <div class="space-y-2">
                      <p class="text-xs text-gray-500">{{ template.description }}</p>
                      <div class="relative group">
                        <p class="text-sm font-mono p-2 bg-gray-50 dark:bg-gray-900 rounded">
                          {{ template.message }}
                        </p>
                        <div
                          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <UButton color="primary" icon="i-lucide-copy" @click.stop="selectTemplate(template)">
                            Use Template
                          </UButton>
                        </div>
                      </div>
                    </div>
                  </UCard>
                </div>
              </div>
            </UCard>
          </template>
        </UModal>
        <UTextarea v-model="formState.message" :rows="4" placeholder="Enter your message here..." class="w-full" />
        <span class="text-xs text-gray-500 mt-1">{{ messageCount }} characters</span>

        <!-- Template Slots Section -->
        <div v-if="messageSlots.length > 0" class="mt-4 space-y-3 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-brackets" class="text-primary" />
            <span class="font-medium">Fill in the template details</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField v-for="slot in messageSlots" :key="slot" :label="formatSlotLabel(slot)" required>
              <template v-if="slot === 'date'">
                <UPopover>
                  <UButton block color="primary" variant="soft"
                    :icon="slotValues[slot] ? undefined : 'i-lucide-calendar'">
                    {{ slotValues[slot] ? formatDate(slotValues[slot] as DateValue) : 'Select date' }}
                  </UButton>
                  <template #content>
                    <UCalendar v-model="slotValues[slot]" @update:model-value="updateMessageWithSlots" />
                  </template>
                </UPopover>
              </template>
              <UInput v-else v-model="slotValues[slot]" :placeholder="'Enter ' + formatSlotLabel(slot).toLowerCase()"
                @input="updateMessageWithSlots" />
            </UFormField>
          </div>
        </div>
      </UFormField>

      <div class="flex justify-end pt-4">
        <UButton :loading="isLoading" :disabled="!isValid || isLoading" @click="sendMessage" color="primary"
          icon="i-lucide-send">
          Send Message
        </UButton>

      </div>
    </div>



    <!-- Results Section -->
    <template v-if="lastResult" #footer>
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <UIcon :name="lastResult.success ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
            :class="lastResult.success ? 'text-success' : 'text-error'" />
          <span :class="lastResult.success ? 'text-success' : 'text-error'">
            {{ lastResult.message }}
          </span>
        </div>
        <div v-if="lastResult.success && lastResult.messageId" class="text-xs text-gray-500">
          Message ID: {{ lastResult.messageId }}
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { smsTemplates, categories, getTemplateIcon, getTemplateColor, generateAiTemplate, type AiTemplateRequest, type SmsResponse } from '@@/data/smsTemplates'
import type { DateValue } from '@internationalized/date'

const toast = useToast()
const helpModal = ref(false)

const { data: helpContent } = await useAsyncData('sms-docs', async () => {
  const doc = await queryCollection('docs').all()
  console.log('Available docs:', doc)
  return doc.find(d => d.title === 'SMS Messaging')
})

interface Props {
  templateId?: string
}

const props = defineProps<Props>()

const countryCodes = [
  { label: '🇸🇬 Singapore (+65)', value: '+65', icon: '🇸🇬' },
  { label: '🇲🇾 Malaysia (+60)', value: '+60', icon: '🇲🇾' },
  { label: '🇮🇩 Indonesia (+62)', value: '+62', icon: '🇮🇩' },
  { label: '🇹🇭 Thailand (+66)', value: '+66', icon: '🇹🇭' },
  { label: '🇻🇳 Vietnam (+84)', value: '+84', icon: '🇻🇳' },
  { label: '🇵🇭 Philippines (+63)', value: '+63', icon: '🇵🇭' },
  { label: '🇮🇳 India (+91)', value: '+91', icon: '🇮🇳' }
]

const formState = ref({
  countryCode: '',
  phoneNumber: '',
  message: '',
  compiledMessage: ''
})

const generateAiTemplateState = useState('generateAiTemplateState', () => ({}))


const isLoading = ref(false)
const lastResult = ref<SmsResponse | null>(null)

const selectedCategory = ref('All')
const searchQuery = ref('')

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Malay', value: 'ms' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Thai', value: 'th' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Hindi', value: 'hi' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Arabic', value: 'ar' }
]

const tones = [
  { label: 'Professional', value: 'professional', icon: 'i-lucide-briefcase' },
  { label: 'Friendly', value: 'friendly', icon: 'i-lucide-smile' },
  { label: 'Urgent', value: 'urgent', icon: 'i-lucide-alert-triangle' },
  { label: 'Casual', value: 'casual', icon: 'i-lucide-coffee' }
]

const aiForm = ref<AiTemplateRequest>({
  purpose: '',
  language: 'en',
  tone: 'professional',
  maxLength: 160
})

const isGenerating = ref(false)

// Slot management
const messageSlots = computed(() => {
  const slotRegex = /\[(.*?)\]/g
  const matches = [...formState.value.message.matchAll(slotRegex)]
  return [...new Set(matches.map(match => match[1]!))]
})

const slotValues = ref<{ [key: string]: string | DateValue | undefined }>({})

const formatSlotLabel = (slot: string) => {
  return slot
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (date: DateValue) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const updateMessageWithSlots = () => {
  let updatedMessage = formState.value.message
  Object.entries(slotValues.value).forEach(([slot, value]) => {
    if (value) {
      const regex = new RegExp(`\\[${slot}\\]`, 'g')
      // Format date if the slot is a date
      const displayValue = slot === 'date' ? formatDate(value) : value
      updatedMessage = updatedMessage.replace(regex, displayValue)
    }
  })
  formState.value.compiledMessage = updatedMessage
}

// Reset slot values when template changes
watch(() => formState.value.message, () => {
  slotValues.value = {}
  formState.value.compiledMessage = formState.value.message
}, { immediate: true })

// Validate all slots are filled
const areSlotsValid = computed(() => {
  if (messageSlots.value.length === 0) return true
  return messageSlots.value.every(slot => {
    const value = slotValues.value[slot]
    if (!value) return false
    // Date slots just need to exist
    if (slot === 'date') return true
    // Other slots need to be non-empty strings
    return value.trim().length > 0
  })
})

// Update isValid to include slot validation
const isValid = computed(() => {
  return formState.value.countryCode &&
    formState.value.phoneNumber &&
    formState.value.message &&
    areSlotsValid.value
})

// Load initial template if templateId is provided
watchEffect(() => {
  if (props.templateId) {
    const template = smsTemplates.find(t => t.id === props.templateId)
    if (template) {
      formState.value.message = template.message
    }
  }
})

const filteredTemplates = computed(() => {
  let templates = smsTemplates

  // Filter by category
  if (selectedCategory.value !== 'All') {
    templates = templates.filter(t => t.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    templates = templates.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.message.toLowerCase().includes(query)
    )
  }

  return templates
})

const messageCount = computed(() => formState.value.message.length)

// Computed property for full phone number
const fullPhoneNumber = computed(() => {
  return `${formState.value.countryCode}${formState.value.phoneNumber.replace(/\s+/g, '')}`
})

async function sendMessage() {
  if (!isValid.value) return

  try {
    isLoading.value = true
    const response = await $fetch('/api/sms/send', {
      method: 'POST',
      body: {
        to: fullPhoneNumber.value,
        message: formState.value.compiledMessage
      }
    })

    if (response.success) {
      toast.add({
        title: 'SMS Sent Successfully',
        description: `Message sent to ${fullPhoneNumber.value}`,
        icon: 'i-lucide-check-circle',
        color: 'success',
        timeout: 5000
      })

      lastResult.value = {
        success: true,
        message: response.message,
        messageId: response.messageId,
        status: response.status,
        details: response.details,
        timestamp: new Date()
      }

      // Reset form
      formState.value = {
        countryCode: formState.value.countryCode, // Keep the country code
        phoneNumber: '',
        message: '',
        compiledMessage: ''
      }
      slotValues.value = {}
    } else {
      toast.add({
        title: 'Failed to Send SMS',
        description: response.message,
        icon: 'i-lucide-alert-triangle',
        color: 'error',
        timeout: 5000
      })

      lastResult.value = {
        success: false,
        message: response.message,
        details: {
          error: response.message,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date()
      }
    }
  } catch (error: any) {
    const errorMessage = error.data?.message || error.message || 'Failed to send SMS'

    toast.add({
      title: 'Error',
      description: errorMessage,
      icon: 'i-lucide-x-circle',
      color: 'error',
      timeout: 5000
    })

    lastResult.value = {
      success: false,
      message: errorMessage,
      details: {
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    }
  } finally {
    isLoading.value = false
  }
}

async function generateTemplate() {
  try {
    isGenerating.value = true
    const template = await generateAiTemplate(aiForm.value)
    selectTemplate(template)
    templateModal.value = false
  } catch (error) {
    console.error('Failed to generate template:', error)
  } finally {
    isGenerating.value = false
  }
}

function selectTemplate(template: typeof smsTemplates[0]) {
  formState.value.message = template.message
  templateModal.value = false
}
</script>
