<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-phone" class="text-primary" />
          <h3 class="font-medium">Call Sender</h3>
        </div>
      </div>
    </template> 

    <div v-if="!callActive" class="flex flex-col items-center gap-4">
      <UAlert v-if="callError" color="red" variant="soft" icon="i-lucide-alert-circle" class="mb-4">
        {{ callError }}
      </UAlert>
      <p class="text-center text-gray-700 mb-4">
        When you start the call, you'll be connected to a virtual assistant using the variables
        you've configured.
      </p>
      <UButton @click="startCall" color="primary" size="xl" class="px-8">
        <template #leading>
          <UIcon name="i-lucide-phone" />
        </template>
        Start Call
      </UButton>
    </div>

    <div v-else class="flex flex-col items-center gap-6">
      <div class="call-status bg-primary-50 p-4 rounded-lg w-full max-w-md text-center">
        <p class="text-lg font-medium text-primary-700">Call in progress</p>
        <p class="text-sm text-gray-600">Connected to virtual assistant</p>
      </div>

      <div class="call-controls flex gap-4">
        <UButton color="gray" variant="soft">
          <template #leading>
            <UIcon name="i-lucide-mic" />
          </template>
          Mute
        </UButton>
        <UButton @click="endCall" color="red" variant="soft">
          <template #leading>
            <UIcon name="i-lucide-phone-off" />
          </template>
          End Call
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Vapi from "@vapi-ai/web"
import { flattenVariables } from '~/server/utils/variableSchema'

const props = defineProps({
  variables: {
    type: Object,
    required: true
  },
  assistantId: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: false,
    default: ''
  }
})

// Default VAPI key with optional prop override
const config = useRuntimeConfig().public
const DEFAULT_VAPI_KEY = config.vapiPublicKey
const apiKey = computed(() => props.apiKey || DEFAULT_VAPI_KEY)

const callActive = useState<boolean>(`call-active-${props.assistantId}`, () => false)
const callError = useState<string | null>(`call-error-${props.assistantId}`, () => null)
const vapiInstance = new Vapi(apiKey.value)

// Functions
function startCall() {
  try {
    // Reset any previous errors
    callError.value = null

    // Set call as active
    callActive.value = true

    // Use the assistant config with flattened variables
    const variables = props.variables.research ? props.variables : flattenVariables(props.variables)
    console.log("Starting call with variables:", variables)

    // variables.json = JSON.stringify(props.variables)
    
    // Configure vapi with our variables and start the call
    const assistantOverrides = {
      transcriber: {
        provider: "deepgram",
        model: "nova-3",
        language: "en-US",
      },
      recordingEnabled: true,
      variableValues: variables,
    }

    vapiInstance.start(props.assistantId, assistantOverrides)

  } catch (error) {
    console.error("Error starting call:", error)
    callActive.value = false
    callError.value = error instanceof Error ? error.message : 'Unknown error occurred'
  }
}

function endCall() {
  callActive.value = false
  if (vapiInstance) {
    vapiInstance.stop()
  }
}

// Clean up when component is unmounted
onUnmounted(() => {
  if (callActive.value && vapiInstance) {
    vapiInstance.stop()
  }
})
</script>

<style scoped></style>
