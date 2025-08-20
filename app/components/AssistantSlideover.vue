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
              <div v-if="item.value === 'postCall'" class="space-y-2">
                <UCard>
                  <template #header>
                    <h2 class="text-xl font-semibold">Post Call Settings</h2>
                  </template>
                  <UForm :state="postCallForm" class="space-y-4">
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
                    <!--<UButton type="submit" color="primary" :loading="loading.postCall">Save Settings</UButton>-->
                  </UForm>
                </UCard>
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

const tagValues = ref([
  { label: 'Follow Up', value: 'Follow Up' },
  { label: 'Interested', value: 'Interested' },
  { label: 'No Intent', value: 'No Intent' },
  { label: 'Not Interested', value: 'Not Interested' },
  { label: 'Other Language', value: 'Other Language' },
  { label: 'Voicemail', value: 'Voicemail' },
]);

const callVariables = ref([
  { label: 'Customer Name', value: 'name' },
  { label: 'Customer Phone Number', value: 'number' },
  { label: 'Customer Email', value: 'email' },
])

const postCallSettings = ref<any>({});
const postCallForm = ref(postCallSettings.value?.value ? JSON.parse(postCallSettings.value?.value) : {
  tagKey: '',
  tagValue: '',
  serverAddress: '',
  businessPhoneNumber: '',
  templateMessageId: '',
  variables: []
});
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

const close = () => {
  emit('close')
  assistantState.resetState()
}

const save = async () => {
  if (!isValid.value) return

  isLoading.value = true
  try {
    assistant.value.model = {
      ...assistant.value.model,
      model: "gpt-5",
    };
    if (postCallForm.value) {
      const response = await $fetch('/api/settings/postCall', {
        method: 'POST',
        body: {
          ...postCallForm.value,
          assistantId: props.assistant.id
        }
      });
    }
    // Save assistant logic here
    const updatedAssistant = await useFetch("/api/assistants/update", {
      method: "POST",
      body: assistant.value,
    });
    emit("updated", updatedAssistant)
    emit("close");
    toast.add({
      title: "Assistant saved",
      description: "Assistant saved successfully",
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
  const responsePostCall = await fetch(`/api/settings/postCall?assistantId=${props.assistant.id}`);
  const dataPostCall = await responsePostCall.json();
  if(dataPostCall.success) {
    postCallSettings.value = JSON.parse(dataPostCall.postCallSettings.value);
    postCallForm.value = postCallSettings.value;
  } else {
    postCallSettings.value = {};
  }
})

const addVariable = () => {
  postCallForm.value.variables.push('')
}

function removeVariable(index: number) {
  postCallForm.value.variables.splice(index, 1)
}

// Cleanup on unmount
onUnmounted(() => {
  assistantState.resetState()
})
</script>
