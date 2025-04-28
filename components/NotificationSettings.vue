<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Notification Channels</h3>
          <UButton
            icon="i-lucide-plus"
            color="primary"
            variant="ghost"
            @click="showChannelModal = true"
          >
            Add Channel
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="(channel, index) in settings.channels"
          :key="index"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <UIcon
              :name="getChannelIcon(channel.type)"
              class="text-lg"
            />
            <div>
              <div class="font-medium">{{ getChannelName(channel) }}</div>
              <div class="text-sm text-gray-500">
                {{ getChannelDescription(channel) }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <USwitch
              v-model="channel.enabled"
              :color="channel.enabled ? 'success' : 'neutral'"
            />
            <UButton
              icon="i-lucide-settings"
              color="info"
              variant="ghost"
              @click="editChannel(index)"
            />
            <UButton
              icon="i-lucide-trash"
              color="error"
              variant="ghost"
              @click="removeChannel(index)"
            />
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Notification Triggers</h3>
      </template>

      <div class="space-y-4">
        <UFormField label="Event Triggers">
          <div class="space-y-2">
            <UCheckbox
              v-model="settings.triggers.onStart"
              label="Job Start"
            />
            <UCheckbox
              v-model="settings.triggers.onComplete"
              label="Job Completion"
            />
            <UCheckbox
              v-model="settings.triggers.onFailure"
              label="Job Failure"
            />
            <UCheckbox
              v-model="settings.triggers.onPause"
              label="Job Pause"
            />
          </div>
        </UFormField>

        <UFormField label="Failure Threshold">
          <UInput
            v-model="settings.triggers.failureThreshold"
            type="number"
            min="0"
            max="100"
            placeholder="Failure percentage to trigger notification"
            trailing="%"
          />
        </UFormField>

        <UFormField label="Progress Updates">
          <UInput
            v-model="settings.triggers.progressInterval"
            type="number"
            min="0"
            placeholder="Minutes between progress updates"
            trailing="minutes"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Add/Edit Channel Modal -->
    <UModal v-model="showChannelModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingChannelIndex === null ? 'Add Channel' : 'Edit Channel' }}
          </h3>
        </template>

        <form @submit.prevent="saveChannel" class="space-y-4">
          <UFormField label="Channel Type" required>
            <USelect
              v-model="channelForm.type"
              :options="channelTypes"
              required
            />
          </UFormField>

          <!-- Email Configuration -->
          <template v-if="channelForm.type === 'email'">
            <UFormField label="Recipients" required>
              <UTextarea
                v-model="emailRecipients"
                placeholder="Enter email addresses (one per line)"
                rows="3"
                required
              />
            </UFormField>
            <UFormField label="From Address">
              <UInput
                v-model="(channelForm.config as any).from"
                type="email"
                placeholder="Optional sender address"
              />
            </UFormField>
          </template>

          <!-- Slack Configuration -->
          <template v-if="channelForm.type === 'slack'">
            <UFormField label="Webhook URL" required>
              <UInput
                v-model="(channelForm.config as any).webhookUrl"
                type="url"
                placeholder="Slack webhook URL"
                required
              />
            </UFormField>
            <UFormField label="Channel">
              <UInput
                v-model="(channelForm.config as any).channel"
                placeholder="Optional channel override"
              />
            </UFormField>
          </template>

          <!-- Webhook Configuration -->
          <template v-if="channelForm.type === 'webhook'">
            <UFormField label="Webhook URL" required>
              <UInput
                v-model="(channelForm.config as any).url"
                type="url"
                placeholder="Webhook URL"
                required
              />
            </UFormField>
            <UFormField label="Headers">
              <UTextarea
                v-model="webhookHeaders"
                placeholder="Enter headers (one per line, key: value)"
                rows="3"
              />
            </UFormField>
          </template>
        </form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showChannelModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="saveChannel"
              :loading="isSaving"
            >
              {{ editingChannelIndex === null ? 'Add Channel' : 'Save Changes' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NotificationConfig, NotificationChannel } from '~/types'

const settings = useState('notificationSettings', () => ({
  channels: [],
  triggers: {
    onStart: false,
    onComplete: false,
    onFailure: false,
    onPause: false,
    failureThreshold: 0,
    progressInterval: 0
  }
}))

// Channel management
const showChannelModal = ref(false)
const editingChannelIndex = ref<number | null>(null)
const isSaving = ref(false)

const channelTypes = [
  { label: 'Email', value: 'email' },
  { label: 'Slack', value: 'slack' },
  { label: 'Webhook', value: 'webhook' }
]

const channelForm = ref<NotificationChannel>({
  type: 'email',
  config: { recipients: [] },
  enabled: true
})

// Form helpers
const emailRecipients = computed({
  get: () => {
    const config = channelForm.value.config as any
    return Array.isArray(config.recipients) 
      ? config.recipients.join('\n')
      : ''
  },
  set: (value: string) => {
    const config = channelForm.value.config as any
    config.recipients = value.split('\n').map(e => e.trim()).filter(Boolean)
  }
})

const webhookHeaders = computed({
  get: () => {
    const config = channelForm.value.config as any
    return Object.entries(config.headers || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
  },
  set: (value: string) => {
    const config = channelForm.value.config as any
    config.headers = Object.fromEntries(
      value.split('\n')
        .map(line => line.split(':').map(s => s.trim()))
        .filter(parts => parts.length === 2)
    )
  }
})

// Methods
const getChannelIcon = (type: string) => {
  switch (type) {
    case 'email': return 'i-lucide-mail'
    case 'slack': return 'i-lucide-message-square'
    case 'webhook': return 'i-lucide-webhook'
    default: return 'i-lucide-bell'
  }
}

const getChannelName = (channel: NotificationChannel) => {
  switch (channel.type) {
    case 'email':
      const config = channel.config as any
      return `Email (${config.recipients.length} recipients)`
    case 'slack':
      return `Slack${(channel.config as any).channel 
        ? ` - ${(channel.config as any).channel}`
        : ''
      }`
    case 'webhook':
      return `Webhook - ${new URL((channel.config as any).url).hostname}`
  }
}

const getChannelDescription = (channel: NotificationChannel) => {
  switch (channel.type) {
    case 'email':
      return (channel.config as any).recipients.join(', ')
    case 'slack':
      return (channel.config as any).webhookUrl
    case 'webhook':
      return (channel.config as any).url
  }
}

const editChannel = (index: number) => {
  editingChannelIndex.value = index
  channelForm.value = JSON.parse(
    JSON.stringify(settings.value.channels[index])
  )
  showChannelModal.value = true
}

const removeChannel = (index: number) => {
  settings.value = {
    ...settings.value,
    channels: settings.value.channels.filter((_, i) => i !== index)
  }
}

const saveChannel = async () => {
  isSaving.value = true
  try {
    if (editingChannelIndex.value === null) {
      settings.value = {
        ...settings.value,
        channels: [...settings.value.channels, { ...channelForm.value }]
      }
    } else {
      const channels = [...settings.value.channels]
      channels[editingChannelIndex.value] = { ...channelForm.value }
      settings.value = {
        ...settings.value,
        channels
      }
    }
    
    showChannelModal.value = false
    editingChannelIndex.value = null
    channelForm.value = {
      type: 'email',
      config: { recipients: [] },
      enabled: true
    }
  } finally {
    isSaving.value = false
  }
}
</script>
