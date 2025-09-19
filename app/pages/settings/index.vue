<template>
  <UContainer class="my-8">
    <div class="space-y-6">
      <!-- Profile Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Profile Settings</h2>
        </template>
        <UForm :state="profileForm" class="space-y-4" @submit="saveProfile">
          <UFormField label="Full Name" required>
            <UInput v-model="profileForm.name" placeholder="Enter your name" />
          </UFormField>
          <UFormField label="Email" required>
            <UInput v-model="profileForm.email" type="email" placeholder="Enter your email" />
          </UFormField>
          <UFormField label="Phone Number">
            <UInput v-model="profileForm.phoneNumber" placeholder="Enter your phone number" />
          </UFormField>
          <UFormField label="Change Password">
            <UInput v-model="profileForm.currentPassword" type="password" placeholder="Current password" />
            <UInput v-model="profileForm.newPassword" type="password" placeholder="New password" class="mt-2" />
          </UFormField>
          <UButton type="submit" color="primary" :loading="loading.profile">Save Changes</UButton>
        </UForm>
      </UCard>

      <!-- Notification Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Notification Settings</h2>
        </template>
        <UForm :state="notificationForm" class="space-y-4" @submit="saveNotifications">
          <UFormField label="Email Notifications">
            <USwitch v-model="notificationForm.emailEnabled" />
          </UFormField>
          <UFormField label="Notification Types" v-if="notificationForm.emailEnabled">
            <div class="space-y-2">
              <UCheckbox v-model="notificationForm.callNotifications" label="Call Updates" />
              <UCheckbox v-model="notificationForm.analyticsReports" label="Analytics Reports" />
              <UCheckbox v-model="notificationForm.systemAlerts" label="System Alerts" />
            </div>
          </UFormField>
          <UButton type="submit" color="primary" :loading="loading.notifications">Save Preferences</UButton>
        </UForm>
      </UCard>

      <!-- Integration Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Integration Settings</h2>
        </template>
        <UForm :state="integrationForm" class="space-y-4" @submit="saveIntegrations">
          <UFormField label="API Key">
            <UInput 
              v-model="integrationForm.apiKey" 
              type="password" 
              placeholder="Enter API Key"
              icon="i-heroicons-key" 
            />
          </UFormField>
          <UFormField label="Webhook URL">
            <UInput 
              v-model="integrationForm.webhookUrl" 
              type="url" 
              placeholder="https://your-webhook.com"
              icon="i-heroicons-link" 
            />
          </UFormField>
          <UButton type="submit" color="primary" :loading="loading.integrations">Save Integration</UButton>
        </UForm>
      </UCard>

      <!-- Metabase Analytics Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Analytics Configuration</h2>
        </template>
        <UForm :state="metabaseForm" class="space-y-4" @submit="saveMetabaseSettings">
          <UFormField
            label="Metabase URL"
            description="The base URL for your Metabase instance"
            required
          >
            <UInput
              v-model="metabaseForm.url"
              placeholder="https://metabase.example.com"
              icon="i-heroicons-globe-alt"
            />
          </UFormField>
          <UFormField
            label="Username"
            description="Your Metabase login username"
            required
          >
            <UInput
              v-model="metabaseForm.username"
              placeholder="admin@example.com"
              icon="i-heroicons-user"
            />
          </UFormField>
          <UFormField
            label="Password"
            :description="isMetabaseConfigured ? 'Leave empty to keep current password' : 'Your Metabase login password'"
            :required="!isMetabaseConfigured"
          >
            <UInput
              v-model="metabaseForm.password"
              type="password"
              :placeholder="isMetabaseConfigured ? 'Enter new password to update' : '••••••••'"
              icon="i-heroicons-lock-closed"
            />
          </UFormField>
          <UFormField
            label="API Key"
            :description="isMetabaseConfigured ? 'Leave empty to keep current API key' : 'Your Metabase API key for programmatic access'"
            :required="!isMetabaseConfigured"
          >
            <UInput
              v-model="metabaseForm.apiKey"
              type="password"
              :placeholder="isMetabaseConfigured ? 'Enter new API key to update' : 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'"
              icon="i-heroicons-key"
            />
          </UFormField>
          <UFormField
            label="Dashboard ID"
            description="Your Metabase dashboard ID"
            required
          >
            <UInput
              v-model="metabaseForm.dashboard"
              placeholder="dashboard-id"
              icon="i-heroicons-chart-bar"
            />
          </UFormField>
          <UButton type="submit" color="primary" :loading="loading.metabase">
            Save Analytics Configuration
          </UButton>
        </UForm>
      </UCard>

      <!-- Application Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Application Settings</h2>
        </template>
        <UForm :state="appForm" class="space-y-4" @submit="saveAppSettings">
          <UFormField label="Theme">
            <URadioGroup
              v-model="appForm.theme"
              orientation="horizontal"
              :items="themeOptions"
              class="flex gap-4"
              size="lg"
            />
          </UFormField>
          <UFormField label="Data Retention">
            <USelect
              v-model="appForm.retention"
              :items="retentionOptions"
              placeholder="Select retention period"
              class="w-full"
              option-attribute="label"
              value-attribute="value"
            />
          </UFormField>
          <UButton type="submit" color="primary" :loading="loading.app">Save Settings</UButton>
        </UForm>
      </UCard>

      <!-- Module Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Module Settings</h2>
        </template>

        <div class="mb-2">
          <div v-for="module in moduleSettings" :key="module.key">
            <UCheckbox class="mb-2" v-model="module.enable" @change="toggleEnable(module)" :label="module.title" />

            <div v-if="module.sub" class="ml-6">
              <div v-for="sub in module.sub" :key="sub.key">
                <UCheckbox class="mb-2" v-model="sub.enable" @change="toggleEnableSub(sub, module)" :label="sub.title" />
              </div>
            </div>
          </div>
        </div>

        <UButton @click="saveModuleSettings" class="mt-2" color="primary" :loading="loading.module">
          Save Settings
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { modules, type Module } from "@@/server/utils/settings";
import { useSettingStore } from "~~/stores/useSettingStore";
import { useUser } from '@/composables/useUser'
import { useUserManagement } from '@/composables/useUserManagement'
import { useMetabase } from '@/composables/useMetabase'

const { updateUserNotifPhone } = useUserManagement()
const { isAdmin, user } = useUser()
const { saveSettings: saveMetabaseConfig, fetchSettings: fetchMetabaseSettings } = useMetabase()

definePageMeta({ middleware: "auth" })

const loading = ref({
  profile: false,
  notifications: false,
  integrations: false,
  app: false,
  module: false,
  postCall: false,
  metabase: false
})

const profileForm = ref({
  name: user.value?.name,
  email: user.value?.email,
  phoneNumber: user.value?.notifPhone,
  currentPassword: '',
  newPassword: ''
})

const notificationForm = ref({
  emailEnabled: false,
  callNotifications: true,
  analyticsReports: true,
  systemAlerts: true
})

const integrationForm = ref({
  apiKey: '',
  webhookUrl: ''
})

const metabaseForm = ref({
  url: '',
  username: '',
  password: '',
  apiKey: '',
  dashboard: ''
})

const isMetabaseConfigured = ref(false)

const colorMode = useColorMode()
const themeOptions = ref(['system', 'light', 'dark'])

const retentionOptions = ref([
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 }
])

const appForm = ref({
  theme: colorMode.value,
  retention: 30
})

const moduleSettings = ref<Module[]>([]);

const settingStore = useSettingStore();

const toggleEnable = (module: Module) => {
  // If a parent module is unchecked, uncheck all submodules
  if (!module.enable && module.sub) {
    module.sub.forEach(subModule => (subModule.enable = false));
  }
};

const toggleEnableSub = (sub: Module, module:Module) => {
  if(sub.enable) {
    module.enable = true;
  }
}

watch(() => appForm.value.theme, (newTheme) => {
  colorMode.preference = newTheme
})

onMounted(async () => {
  const response = await fetch('/api/settings/module');
  const data = await response.json();
  if(data.success) {
    moduleSettings.value = data.modules;
  } else {
    moduleSettings.value = modules;
  }

  // Load existing Metabase settings
  const metabaseSettings = await fetchMetabaseSettings();
  if (metabaseSettings) {
    isMetabaseConfigured.value = true;
    metabaseForm.value = {
      url: metabaseSettings.url || '',
      username: metabaseSettings.username || '',
      password: '', // Don't populate password for security
      apiKey: '', // Don't populate API key for security
      dashboard: metabaseSettings.dashboard || ''
    };
  }
})

async function saveProfile() {
  loading.value.profile = true
  try {
    // Save profile logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    await updateUserNotifPhone(profileForm.value.phoneNumber)
    useToast().add({ title: 'Profile updated', color: 'success' })
  } catch (error) {
    useToast().add({ title: 'Error saving profile', color: 'error' })
  } finally {
    loading.value.profile = false
  }
}

async function saveNotifications() {
  loading.value.notifications = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    useToast().add({ title: 'Notification preferences saved', color: 'success' })
  } finally {
    loading.value.notifications = false
  }
}

async function saveIntegrations() {
  loading.value.integrations = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    useToast().add({ title: 'Integration settings saved', color: 'success' })
  } finally {
    loading.value.integrations = false
  }
}

async function saveAppSettings() {
  loading.value.app = true
  try {
    colorMode.preference = appForm.value.theme
    await new Promise(resolve => setTimeout(resolve, 1000))
    useToast().add({
      title: 'Theme updated',
      description: `Switched to ${appForm.value.theme} mode`,
      color: 'success'
    })
  } finally {
    loading.value.app = false
  }
}

async function saveModuleSettings() {
  loading.value.module = true
  try {
    const response = await $fetch('/api/settings/module', {
      method: 'POST',
      body: {
        modules: moduleSettings.value
      }
    })
    useToast().add({ title: 'Module settings saved', color: 'success' })
  } catch (error) {
    useToast().add({ title: 'Error saving module settings', color: 'error' })
  } finally {
    loading.value.module = false
    settingStore.startReload()
  }
}

async function saveMetabaseSettings() {
  loading.value.metabase = true
  try {
    // For new configurations, require all fields
    // For updates, only require that at least one main field is provided
    if (!isMetabaseConfigured.value) {
      // New configuration - all fields required
      if (!metabaseForm.value.url || !metabaseForm.value.username ||
          !metabaseForm.value.password || !metabaseForm.value.apiKey ||
          !metabaseForm.value.dashboard) {
        useToast().add({
          title: 'Validation Error',
          description: 'All fields are required for initial Metabase configuration',
          color: 'error'
        })
        return
      }
    } else {
      // Update configuration - at least one main field required
      if (!metabaseForm.value.url && !metabaseForm.value.username && !metabaseForm.value.dashboard) {
        useToast().add({
          title: 'Validation Error',
          description: 'Please provide at least one field to update',
          color: 'error'
        })
        return
      }
    }

    const response = await saveMetabaseConfig(metabaseForm.value)
    if (response.status === 'success') {
      useToast().add({
        title: 'Analytics configuration saved',
        description: isMetabaseConfigured.value
          ? 'Metabase settings have been updated successfully'
          : 'Metabase has been configured successfully',
        color: 'success'
      })

      // Update configuration status
      if (!isMetabaseConfigured.value) {
        isMetabaseConfigured.value = true
      }

      // Clear sensitive fields after successful save
      metabaseForm.value.password = ''
      metabaseForm.value.apiKey = ''
    } else {
      useToast().add({
        title: 'Error saving analytics configuration',
        description: response.message,
        color: 'error'
      })
    }
  } catch (error) {
    useToast().add({
      title: 'Error saving analytics configuration',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  } finally {
    loading.value.metabase = false
  }
}

</script>