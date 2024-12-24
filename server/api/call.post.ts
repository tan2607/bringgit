import { VapiProvider } from '../utils/providers/vapi'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { phoneNumber, assistantId } = body

    if (!process.env.VAPI_API_KEY) {
      throw new Error('VAPI API key is not configured')
    }

    if (!assistantId) {
      throw new Error('Assistant ID is required')
    }

    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }

    // Validate phone number format (E.164)
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      throw new Error('Phone number must be in E.164 format (e.g., +6597599995)')
    }

    // Initialize VAPI provider
    const vapi = VapiProvider.initialize(process.env.VAPI_API_KEY)

    // Create the call
    const call = await vapi.client.calls.create({
      assistantId,
      phoneNumberId:  "b3b2f6c4-fc24-4ef5-8b92-477808da619b",
      customer: {
        "number": phoneNumber
      }
    })

    return {
      success: true,
      callId: call.id
    }
  } catch (error: any) {
    console.error('Call Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
