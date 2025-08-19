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

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Post Call Settings</h2>
        </template>
        <UForm :state="postCallForm" class="space-y-4 w-1/2" @submit="savePostCallSettings">
          <UFormField label="Criteria">
           <div class="flex gap-2">
            <USelect
              v-model="postCallForm.tagKey"
              :items="tagKeys"
              placeholder="Select Tag Key"
              class="w-1/2"
              option-attribute="label"
              value-attribute="value"
            />
            <USelect
              v-model="postCallForm.tagValue"
              :items="tagValues"
              placeholder="Select Tag Value"
              class="w-1/2"
              option-attribute="label"
              value-attribute="value"
            />
           </div>
          </UFormField>
          <UFormField label="Server Address">
            <UInput 
              v-model="postCallForm.serverAddress" 
              type="url" 
              placeholder="https://your-instance.keyrepy.com"
              icon="i-heroicons-link" 
              class="w-full"
            />
          </UFormField>
          <UFormField label="Business Phone Number">
            <UInput 
              v-model="postCallForm.businessPhoneNumber" 
              type="text" 
              placeholder="1234567890"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Template Message ID">
            <UInput 
              v-model="postCallForm.templateMessageId" 
              type="text" 
              placeholder="template_id_123"
              class="w-full"
            />
          </UFormField>
          <div class="border border-muted p-4 border-dashed">
            <UFormField label="Variables" class="space-y-4">
            <div class="space-y-2">
              <div v-for="variable,index in postCallForm.variables" :key="index" class="flex justify-center items-center gap-2"> 
                <div>&#123;&#123;{{ index + 1 }}&#125;&#125;</div>
                <USelect
                  v-model="postCallForm.variables[index]"
                  :key="index"
                :items="callVariables"
                placeholder="Select Variable"
                class="w-full"
                option-attribute="label"
                value-attribute="value"
              />
              <UButton type="button" size="sm" class="cursor-pointer" color="error" @click="removeVariable(index)" icon="i-heroicons-trash"></UButton>
              </div>
              <UButton class="my-2" type="button" color="primary" @click="addVariable">Add Variable</UButton>
            </div>
            </UFormField>
          </div>
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
const { updateUserNotifPhone } = useUserManagement()
const { isAdmin, user } = useUser()

const tagKeys = ref([
  { label: 'Result', value: 'Result' },
]);

const tagValues = ref([
  { label: 'Success', value: 'Success' },
  { label: 'Failed', value: 'Failed' },
]);

const callVariables = ref([
  { label: 'Call ID', value: 'callId' },
  { label: 'Customer', value: 'customer' },
  { label: 'Assistant', value: 'assistant' },
  { label: 'Assistant Overrides', value: 'assistantOverrides' },
  { label: 'Bot Phone Number', value: 'botPhoneNumber' },
  { label: 'Created At', value: 'createdAt' },
  { label: 'Duration', value: 'duration' },
  { label: 'Ended At', value: 'endedAt' },
  { label: 'Ended Reason', value: 'endedReason' },
  { label: 'Messages', value: 'messages' },
  { label: 'Recording URL', value: 'recordingUrl' },
  { label: 'Review', value: 'review' },
  { label: 'Started At', value: 'startedAt' },
  { label: 'Status', value: 'status' },
  { label: 'Structured Data', value: 'structuredData' },
  { label: 'Summary', value: 'summary' },
  { label: 'Tags', value: 'tags' },
  { label: 'Transcript', value: 'transcript' },
  { label: 'Bot Assistant ID', value: 'botAssistantId' },
  { label: 'Bot Phone Number ID', value: 'botPhoneNumberId' },
])

definePageMeta({ middleware: "auth" })

const loading = ref({
  profile: false,
  notifications: false,
  integrations: false,
  app: false,
  module: false,
  postCall: false
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
const postCallSettings = ref<any>({});
const postCallForm = ref(postCallSettings.value?.value ? JSON.parse(postCallSettings.value?.value) : {
  tagKey: '',
  tagValue: '',
  serverAddress: '',
  businessPhoneNumber: '',
  templateMessageId: '',
  variables: []
});

const addVariable = () => {
  postCallForm.value.variables.push('')
}

const integrationForm = ref({
  apiKey: '',
  webhookUrl: ''
})

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
  const responsePostCall = await fetch('/api/settings/postCall');
  const data = await response.json();
  const dataPostCall = await responsePostCall.json();
  console.log(dataPostCall)
  if(data.success) {
    moduleSettings.value = data.modules;
    postCallSettings.value = JSON.parse(dataPostCall.postCallSettings.value);
    postCallForm.value = postCallSettings.value;
  } else {
    moduleSettings.value = modules;
    postCallSettings.value = {};
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

async function savePostCallSettings() {
  loading.value.postCall = true
  try {
    const response = await $fetch('/api/settings/postCall', {
      method: 'POST',
      body: {
        ...postCallForm.value
      }
    })
    useToast().add({ title: 'Post call settings saved', color: 'success' })
  } catch (error) {
    useToast().add({ title: 'Error saving post call settings', color: 'error' })
  } finally {
    loading.value.postCall = false
    settingStore.startReload()
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

function removeVariable(index: number) {
  postCallForm.value.variables.splice(index, 1)
}

</script>