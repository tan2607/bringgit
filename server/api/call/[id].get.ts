import { VapiProvider } from '../../utils/providers/vapi'

export default defineEventHandler(async (event) => {
  try {
    if (!process.env.VAPI_API_KEY) {
      throw new Error('VAPI API key is not configured')
    }

    const callId = event.context.params?.id
    if (!callId) {
      throw new Error('Call ID is required')
    }

    // Initialize VAPI provider
    const vapi = VapiProvider.getInstance()

    // Get call status
    const call = await vapi.client.calls.get(callId)

    return {
      ...call
    }
  } catch (error: any) {
    console.error('Call Status Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
