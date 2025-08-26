<template>
  <USlideover>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bot" class="w-5 h-5" />
          <span class="text-lg font-medium">{{ t(`assistant.${assistant?.id ? 'edit' : 'create'}`) }}</span>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full">
        <UTabs v-model="assistantState.activeTab.value" :items="tabs">
          <template #content="{ item }">
            <div class="p-4">
              <!-- Agent Tab -->
              <div v-if="item.value === 'agent'" class="space-y-4">
                <UFormField :label="t('assistant.name')" required>
                  <UInput class="w-full" v-model="assistant.name" />
                </UFormField>

                <UFormField :label="t('assistant.transcriber-language')" required>
                  <USelect 
                  class="w-full"
                  v-model="assistant.transcriber.language" :items="languageOptions" option-attribute="label" />
                  <template #help>
                    {{ t('assistant.language-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.firstMessage')" required>
                  <UTextarea 
                  class="w-full"
                  v-model="assistant.firstMessage" :rows="2" />
                  <template #help>
                    {{ t('assistant.firstMessage-help') }}
                  </template>
                </UFormField>

                <UFormField :label="t('assistant.systemPrompt')" required>
                  <UTextarea 
                  class="w-full"
                  v-model="assistant.prompt" :rows="10" autoresize :maxrows="30" />
                  <template #help>
                    {{ t('assistant.systemPrompt-help') }}
                  </template>
                </UFormField>
              </div>

              <!-- Analysis Tab -->
              <div v-if="item.value === 'analysis'" class="space-y-6">
                <!-- Evaluation Criteria -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium">{{ t('analysis.evaluation-criteria') }}</h3>
                    <UButton color="primary" variant="soft" icon="i-lucide-plus" @click="openAddCriteria">
                      {{ t('analysis.add-criterion') }}
                    </UButton>
                  </div>

                  <div v-if="assistant.criteria?.length" class="space-y-4">
                    <UCard v-for="criterion in assistant.criteria" :key="criterion.id"
                      class="bg-gray-50 dark:bg-gray-800/50">
                      <div class="flex justify-between items-start gap-4">
                        <div class="space-y-1 flex-1">
                          <h4 class="font-medium">{{ criterion.name }}</h4>
                          <p class="text-sm text-gray-500">{{ criterion.description }}</p>
                        </div>
                        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs"
                          @click="deleteCriterion(criterion.id)" />
                      </div>
                    </UCard>
                  </div>
                  <div v-else class="text-center py-8 text-gray-500">
                    {{ t('analysis.no-criteria') }}
                  </div>
                </div>
              </div>

              <!-- Post Call Tab with Multiple Panels -->
              <div v-if="item.value === 'postCall'" class="space-y-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold">Post Call Settings</h2>
                  <UButton color="primary" variant="soft" icon="i-lucide-plus" @click="addPostCallPanel">
                    Add Configuration
                  </UButton>
                </div>

                <!-- Multiple Post Call Configuration Panels -->
                <div v-if="postCallConfigurations.length > 0" class="space-y-4">
                  <UCard v-for="(config, index) in postCallConfigurations" :key="config.id" :ui="{ body: `${config.isExpanded ? 'block' : 'hidden'}`}" 
                    class="relative border-l-4" 
                    :class="getConfigCardClass(config)">
                    <template #header>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <h3 class="font-medium">
                            Configuration {{ index + 1 }}
                          </h3>
                        </div>
                        <div class="flex items-center gap-2">
                          <UButton 
                            color="gray" 
                            variant="ghost" 
                            size="xs"
                            :icon="config.isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                            @click="config.isExpanded = !config.isExpanded"
                          />
                          <UButton 
                            color="error" 
                            variant="ghost" 
                            icon="i-lucide-trash-2" 
                            size="xs"
                            @click="removePostCallPanel(config.id)" 
                          />
                        </div>
                      </div>
                    </template>

                    <div>
                      <UForm :state="config" class="space-y-4">
                        <UFormField label="Criteria">
                          <div class="flex gap-2">
                            <USelect
                              v-model="config.tagKey"
                              :items="tagKeys"
                              placeholder="Select Tag Key"
                              class="w-1/2"
                              option-attribute="label"
                              value-attribute="value"
                            />
                            <USelect
                              v-model="config.tagValue"
                              :items="getTagValues(config.tagKey)"
                              placeholder="Select Tag Value"
                              class="w-1/2"
                              option-attribute="label"
                              value-attribute="value"
                            />
                          </div>
                        </UFormField>
                        
                        <UFormField label="Server Address">
                          <UInput 
                            v-model="config.serverAddress" 
                            type="url" 
                            placeholder="https://your-instance.keyrepy.com"
                            icon="i-heroicons-link" 
                            class="w-full"
                          />
                        </UFormField>
                        
                        <UFormField label="Business Phone Number">
                          <UInput 
                            v-model="config.businessPhoneNumber" 
                            type="text" 
                            placeholder="1234567890"
                            class="w-full"
                          />
                        </UFormField>
                        
                        <UFormField label="Template Message ID">
                          <UInput 
                            v-model="config.templateMessageId" 
                            type="text" 
                            placeholder="template_id_123"
                            class="w-full"
                          />
                        </UFormField>
                        
                        <div class="border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                          <UFormField label="Variables" class="space-y-4">
                            <div class="space-y-2">
                              <div v-for="(variable, varIndex) in config.variables" :key="varIndex" 
                                class="flex justify-center items-start gap-2"> 
                                <div class="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1">
                                  &#123;&#123;{{ varIndex + 1 }}&#125;&#125;
                                </div>
                                <div class="flex-1 space-y-2">
                                  <USelect
                                    v-model="config.variables[varIndex]"
                                    :items="callVariables"
                                    placeholder="Select Variable"
                                    class="w-full"
                                    option-attribute="label"
                                    value-attribute="value"
                                  />
                                  <UInput
                                    v-if="config.variables[varIndex] === 'fixedValue'"
                                    v-model="config.fixedValues[varIndex]"
                                    placeholder="Enter fixed value"
                                    class="w-full"
                                  />
                                </div>
                                <UButton 
                                  type="button" 
                                  size="sm" 
                                  color="error" 
                                  variant="ghost"
                                  @click="removeVariable(config, varIndex)" 
                                  icon="i-heroicons-trash"
                                  class="mt-1"
                                />
                              </div>
                              <UButton 
                                class="mt-2" 
                                type="button" 
                                color="primary" 
                                variant="soft"
                                size="sm"
                                @click="addVariable(config)"
                                icon="i-lucide-plus"
                              >
                                Add Variable
                              </UButton>
                            </div>
                          </UFormField>
                        </div>

                        <!-- Configuration Status -->
                        <div class="flex items-center gap-2 p-3 rounded-lg" 
                          :class="isConfigurationValid(config) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                          <UIcon 
                            :name="isConfigurationValid(config) ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'" 
                            :class="isConfigurationValid(config) ? 'text-green-500' : 'text-red-500'"
                            class="w-4 h-4"
                          />
                          <span class="text-sm" 
                            :class="isConfigurationValid(config) ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                            {{ isConfigurationValid(config) ? 'Configuration is valid' : 'Please fill all required fields' }}
                          </span>
                        </div>
                      </UForm>
                    </div>
                  </UCard>
                </div>

                <div v-else class="text-center py-12 text-gray-500">
                  <UIcon name="i-lucide-settings" class="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p class="text-lg font-medium mb-2">No post call configurations</p>
                  <p class="text-sm">Add a configuration to set up post call actions based on different criteria.</p>
                  <UButton color="primary" class="mt-4" @click="addPostCallPanel" icon="i-lucide-plus">
                    Add Your First Configuration
                  </UButton>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="soft" @click="close">
          {{ t('cancel') }}
        </UButton>
        <UButton color="primary" :loading="isLoading" :disabled="!isValid" @click="save">
          {{ t('save') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantState } from '@/composables/useAssistantState'
import TestSlideover from './assistant/TestSlideover.vue'
import CriteriaSlideover from './assistant/CriteriaSlideover.vue'

import { languages } from '@@/i18n/languages'
import type { Assistant } from '@@/types/assistant'

const emit = defineEmits(["updated", "close"]);
const toast = useToast();
const { t } = useI18n()
const overlay = useOverlay()
const testSlideover = overlay.create(TestSlideover)
const criteriaSlideover = overlay.create(CriteriaSlideover)

const assistantState = useAssistantState()

const tagKeys = ref([
  { label: 'Result', value: 'Result' },
  { label: 'None', value: 'None' },
]);

const tagValuesByKey = ref({
  'Result': [
    { label: 'Follow Up', value: 'Follow Up' },
    { label: 'Interested', value: 'Interested' },
    { label: 'No Intent', value: 'No Intent' },
    { label: 'Not Interested', value: 'Not Interested' },
    { label: 'Other Language', value: 'Other Language' },
    { label: 'Voicemail', value: 'Voicemail' },
  ],
  'None': []
});

const callVariables = ref([
  { label: 'Customer Name', value: 'name' },
  { label: 'Customer Phone Number', value: 'number' },
  { label: 'Customer Email', value: 'email' },
  { label: 'Recording URL', value: 'recordingUrl' },
  { label: 'Fixed Value', value: 'fixedValue' },
])

// Multiple post call configurations
const postCallConfigurations = ref<PostCallConfiguration[]>([]);

const props = defineProps<{
  assistant: Assistant
}>()

const assistant = ref<Assistant>(props.assistant)

if (!assistant.value.transcriber) {
  assistant.value.transcriber = {
    language: 'en',
    model: 'gpt-4o-transcribe',
    provider: 'openai'
  }
}

const isLoading = ref(false)

const tabs = computed(() => [
  {
    label: t('assistant.agent'),
    value: 'agent',
    icon: 'i-lucide-bot'
  },
  {
    label: t('assistant.analysis'),
    value: 'analysis',
    icon: 'i-lucide-chart-bar'
  },
  {
    label: t('assistant.postCall'),
    value: 'postCall',
    icon: 'i-lucide-phone'
  }
])

const languageOptions = computed(() => languages.map(lang => ({
  value: lang.code,
  label: lang.name
})))

const isValid = computed(() => {
  return assistant.value.name &&
    assistant.value.transcriber?.language &&
    assistant.value.firstMessage &&
    assistant.value.model?.messages?.[0]?.content
})

// Generate unique ID for configurations
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add new post call configuration panel
const addPostCallPanel = () => {
  const newConfig = {
    id: generateId(),
    tagKey: '',
    tagValue: '',
    serverAddress: '',
    businessPhoneNumber: '',
    templateMessageId: '',
    variables: [],
    fixedValues: [],
    isExpanded: true
  };
  postCallConfigurations.value.push(newConfig);
}

// Remove post call configuration panel
const removePostCallPanel = (configId: string) => {
  postCallConfigurations.value = postCallConfigurations.value.filter(config => config.id !== configId);
}

// Get tag values based on selected tag key
const getTagValues = (tagKey: string) => {
  return tagValuesByKey.value[tagKey] || [];
}

// Add variable to specific configuration
const addVariable = (config: any) => {
  config.variables.push('');
  if (!config.fixedValues) config.fixedValues = [];
  config.fixedValues.push('');
}

// Remove variable from specific configuration
const removeVariable = (config: any, index: number) => {
  config.variables.splice(index, 1);
  if (config.fixedValues) {
    config.fixedValues.splice(index, 1);
  }
}

// Check if configuration is valid
const isConfigurationValid = (config: any) => {
  return config.tagKey && 
         config.tagValue && 
         config.serverAddress && 
         config.businessPhoneNumber && 
         config.templateMessageId;
}

// Get card styling based on configuration status
const getConfigCardClass = (config: any) => {
  if (isConfigurationValid(config)) {
    return 'border-l-green-500 bg-green-50/30 dark:bg-green-900/10';
  } else {
    return 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10';
  }
}
const close = () => {
  emit('close')
  assistantState.resetState()
}

const save = async () => {
  let isValid = true
  postCallConfigurations.value.forEach(config => {
    if (!isConfigurationValid(config)) {
      isValid = false
    }
  })

  if (!isValid) {
    toast.add({
      title: "Invalid configuration",
      description: "Please check the post call configurations",
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    assistant.value.model = {
      ...assistant.value.model,
      model: "gpt-5",
    };
    
    // Save all post call configurations
    await $fetch('/api/settings/postCall', {
        method: 'POST',
        body: {
          configurations: postCallConfigurations.value,
          assistantId: props.assistant.id
        }
      });
    
    // Save assistant logic here
    const updatedAssistant = await useFetch("/api/assistants/update", {
      method: "POST",
      body: assistant.value,
    });
    
    emit("updated", updatedAssistant)
    emit("close");
    toast.add({
      title: "Assistant saved",
      description: "Assistant and post call configurations saved successfully",
      color: "success",
    });
  } catch (error: any) {
    console.error('Save assistant error:', error)
    toast.add({
      title: "Assistant save failed",
      description: error.message,
      color: "error",
    });
  } finally {
    isLoading.value = false
  }
}

const openTest = () => {
  assistantState.isTestMode.value = true
  testSlideover.open()
}

const openAddCriteria = () => {
  criteriaSlideover.open()
}

const deleteCriterion = (id: string) => {
  assistant.value.criteria = assistant.value.criteria?.filter(c => c.id !== id)
}

onMounted(async () => {
  if (props.assistant) {
    assistantState.setAssistant(props.assistant)
  }
  
  // Get structured data from assistant's analysis plan
  if (props.assistant?.analysisPlan?.structuredDataPlan?.schema?.properties) {
    const schemaProperties = props.assistant.analysisPlan.structuredDataPlan.schema.properties;
    
    // Add schema keys to callVariables
    const schemaVariables = Object.keys(schemaProperties).map(key => ({
      label: key,
      value: `structuredData_${key}`
    }));
    
    callVariables.value = [
      ...callVariables.value,
      ...schemaVariables
    ];
  }
  
  // Load existing post call configurations
  try {
    const responsePostCall = await fetch(`/api/settings/postCall?assistantId=${props.assistant.id}`);
    const dataPostCall = await responsePostCall.json();

    console.log(dataPostCall)
    
    if (dataPostCall.success && dataPostCall.postCallSettings) {
      // Handle both single configuration (backward compatibility) and multiple configurations
      const configurations = JSON.parse(dataPostCall.postCallSettings.value || '{}').configurations
      if (Array.isArray(configurations)) {
        postCallConfigurations.value = configurations.map(config => ({
          ...config,
          id: config.id || generateId(),
          fixedValues: config.fixedValues || [],
          isExpanded: false
        }));
      } else {
        // Convert old single configuration to new format
        const oldConfig = JSON.parse(dataPostCall.postCallSettings.value || '{}');
        if (Object.keys(oldConfig).length > 0) {
          postCallConfigurations.value = [{
            ...oldConfig,
            id: generateId(),
            fixedValues: oldConfig.fixedValues || [],
            isExpanded: false
          }];
        }
      }
    }
  } catch (error) {
    console.error('Error loading post call settings:', error);
  }
})

// Cleanup on unmount
onUnmounted(() => {
  assistantState.resetState()
})
</script>