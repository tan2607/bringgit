<template>
  <UContainer class="my-8">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bot" class="w-6 h-6" />
        <h1 class="text-2xl font-bold">{{ t('assistant-list') }}</h1>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        :label="t('assistant.create')"
        @click="openCreateSlideover"
      />
    </div>

    <!-- Upgrade Recommendations Panel -->
    <div class="my-6 border-t pt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Assistant Upgrade Recommendations</h2>
        <UButton 
          v-if="hasAnyRecommendations" 
          color="primary" 
          :loading="isApplyingAll" 
          :disabled="isApplyingAll || !hasAnyRecommendations"
          @click="applyAllRecommendations"
        >
          Apply All Recommendations
        </UButton>
      </div>
      
      <!-- Progress bar for bulk upgrades -->
      <div v-if="isApplyingAll" class="mb-4">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>Upgrading assistants...</span>
          <span>{{ upgradeProgress }}% ({{ Math.ceil(totalUpgradeCount * upgradeProgress / 100) }} of {{ totalUpgradeCount }})</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" :style="{ width: upgradeProgress + '%' }"></div>
        </div>
      </div>
      
      <div v-for="assistant in sortedAssistants" :key="assistant.id" class="mb-4">
        <div v-if="assistantRecommendations[assistant.id]?.length" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-yellow-800">{{ assistant.name }}</h3>
            <UButton
              color="primary"
              size="xs"
              :loading="isApplying[assistant.id]"
              :disabled="!selectedRecommendations[assistant.id]?.length"
              @click="applyRecommendations(assistant)"
            >
              Apply Selected
            </UButton>
          </div>
          <p class="text-xs text-gray-500 mb-2">Found {{ assistantRecommendations[assistant.id]?.length }} recommendations</p>
          <ul class="list-disc ml-6">
            <li v-for="rec in assistantRecommendations[assistant.id]" :key="rec.suggestion" class="flex items-center gap-2 my-2">
              <UCheckbox
                :model-value="isRecommendationSelected(assistant.id, rec)"
                @update:model-value="toggleRecommendation(assistant.id, rec, $event)"
                :value="rec"
                class="mr-2"
                :label="rec.message + ' (' + rec.suggestion + ')'"
              />
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Debug information -->
      <div class="bg-gray-100 p-4 rounded mt-4 text-sm" v-if="!hasAnyRecommendations">
        <p class="font-medium">No upgrade recommendations found for any assistants.</p>
        <p class="text-xs mt-2">The system checks for:</p>
        <ul class="list-disc ml-6 text-xs mt-1">
          <li>Assistants with recording disabled (recommended to enable)</li>
          <li>OpenAI models that could be upgraded to gpt-4.1</li>
          <li>Google models that could be upgraded to gemini-2.0-flash</li>
          <li>Cartesia voice models that should use sonic-2</li>
          <li>Deepgram transcribers that could use nova-3 with multi-language</li>
        </ul>
      </div>
    </div>


    <AssistantTable :data="sortedAssistants" />
    
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" })
import { useAssistants } from '@/composables/useAssistants'
import AssistantTable from '@/components/AssistantTable.vue'
import CreateAssistantSlideover from '@/components/assistants/CreateAssistantSlideover.vue'
import { useI18n } from 'vue-i18n'
import { getUpgradeRecommendations, type UpgradeRecommendation } from '@/utils/assistantUpgradeEvaluator'

const { t } = useI18n()
const { assistants, fetchAssistants } = useAssistants()
const slideover = useSlideover()
const toast = useToast()

function openCreateSlideover() {
  slideover.open(CreateAssistantSlideover, {
      title: t('assistant.create'),
      onCreated: () => {
        fetchAssistants()
      }
  })
}

const sortedAssistants = computed(() => {
  if(!assistants.value) return []
  return assistants.value.sort((a, b) => a.name.localeCompare(b.name))
})

// Compute recommendations for each assistant
const assistantRecommendations = computed(() => {
  if (!assistants.value) return {}
  const recs: Record<string, UpgradeRecommendation[]> = {}
  for (const assistant of assistants.value) {
    recs[assistant.id] = getUpgradeRecommendations({
      modelProvider: assistant.model.provider,
      model: assistant.model.model,
      voiceProvider: assistant.voice.provider,
      voiceModel: assistant.voice.model,
      transcriberModel: assistant.transcriber?.model,
      transcriberLanguage: assistant.transcriber?.language,
      transcriberProvider: assistant.transcriber?.provider,
    })
    // Initialize selectedRecommendations structure for this assistant
    if (recs[assistant.id]?.length && !selectedRecommendations.value[assistant.id]) {
      selectedRecommendations.value[assistant.id] = []
    }
    
    // Debug output to console
    console.log(`Assistant ${assistant.name} (${assistant.id}) has ${recs[assistant.id]?.length || 0} recommendations`)
  }
  return recs
})

// State for selected recommendations per assistant
const selectedRecommendations = ref<Record<string, UpgradeRecommendation[]>>({})
const isApplying = ref<Record<string, boolean>>({})
const isApplyingAll = ref(false)
const upgradeProgress = ref(0)
const totalUpgradeCount = ref(0)

// Check if any assistant has recommendations
const hasAnyRecommendations = computed(() => {
  if (!assistantRecommendations.value) return false
  return Object.values(assistantRecommendations.value).some(recs => recs && recs.length > 0)
})

// Helper functions for recommendation selection
function isRecommendationSelected(assistantId: string, recommendation: UpgradeRecommendation): boolean {
  if (!selectedRecommendations.value[assistantId]) return false
  return selectedRecommendations.value[assistantId].some(r => 
    r.type === recommendation.type && r.suggestion === recommendation.suggestion
  )
}

function toggleRecommendation(assistantId: string, recommendation: UpgradeRecommendation, selected: boolean): void {
  // Initialize the array if it doesn't exist
  if (!selectedRecommendations.value[assistantId]) {
    selectedRecommendations.value[assistantId] = []
  }
  
  if (selected) {
    // Add recommendation if not already selected
    if (!isRecommendationSelected(assistantId, recommendation)) {
      selectedRecommendations.value[assistantId].push(recommendation)
    }
  } else {
    // Remove recommendation if selected
    selectedRecommendations.value[assistantId] = selectedRecommendations.value[assistantId].filter(r => 
      !(r.type === recommendation.type && r.suggestion === recommendation.suggestion)
    )
  }
  
  // Force reactivity update
  selectedRecommendations.value = { ...selectedRecommendations.value }
}

async function applyRecommendations(assistant: any) {
  const selected = selectedRecommendations.value[assistant.id] || []
  if (!selected.length) return
  isApplying.value[assistant.id] = true
  // Prepare patch object
  const patch: any = {}
  for (const rec of selected) {
    if (rec.type === 'recording') {
      // Enable recording
      patch.recordingEnabled = true
    } else if (rec.type === 'model' && rec.provider === assistant.model.provider) {
      // Use provider-specific target model from the recommendation
      patch.model = rec.targetModel
    } else if (rec.type === 'voice' && rec.provider === assistant.voice.provider) {
      // Use provider-specific voice model
      patch.voiceModel = rec.targetModel
    } else if (rec.type === 'transcriber' && rec.provider === assistant.transcriber?.provider) {
      // Use provider-specific transcriber model and language
      patch.transcriberModel = rec.targetModel
      if (rec.targetLanguage) {
        patch.transcriberLanguage = rec.targetLanguage
      }
    }
  }
  try {
    // Use the updated assistants update POST endpoint that now supports all fields
    await $fetch('/api/assistants/update', {
      method: 'POST',
      body: {
        id: assistant.id,
        ...patch  // This now includes all our upgrade changes and will be properly processed
      }
    })
    toast.add({
      title: 'Assistant upgraded successfully!',
      description: `Assistant ${assistant.name} has been upgraded successfully!`,
      type: 'success'
    })
    // Refresh list
    await fetchAssistants()
    // Clear selected
    selectedRecommendations.value[assistant.id] = []
  } catch (e) {
    toast.add({
      title: 'Failed to apply recommendations',
      description: 'Failed to apply recommendations',
      type: 'error'
    })

    console.error(e)
  } finally {
    isApplying.value[assistant.id] = false
  }
}

// Apply all recommendations across all assistants with rate-limit delay
async function applyAllRecommendations() {
  isApplyingAll.value = true
  upgradeProgress.value = 0
  
  // Snapshot assistants with recommendations
  const assistantsToUpdate = sortedAssistants.value.filter(a => assistantRecommendations.value[a.id]?.length)
  totalUpgradeCount.value = assistantsToUpdate.length
  
  for (let i = 0; i < assistantsToUpdate.length; i++) {
    const assistant = assistantsToUpdate[i]
    // Select all recommendations for this assistant
    selectedRecommendations.value[assistant.id] = [...assistantRecommendations.value[assistant.id]]
    await applyRecommendations(assistant)
    
    // Update progress
    upgradeProgress.value = Math.round(((i + 1) / totalUpgradeCount.value) * 100)
    
    // Delay between calls to avoid rate limits
    if (i < assistantsToUpdate.length - 1) {
      await new Promise(res => setTimeout(res, 500))
    }
  }
  
  // Keep progress at 100% for a moment before resetting
  await new Promise(res => setTimeout(res, 1000))
  isApplyingAll.value = false
  upgradeProgress.value = 0
}

onMounted(() => {
  fetchAssistants()
})
</script>
