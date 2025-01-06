import { VapiProvider } from '../utils/providers/vapi'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    let { phoneNumber, assistantId, phoneNumberId } = body

    if (!process.env.VAPI_API_KEY) {
      throw new Error('VAPI API key is not configured')
    }
    const vapi = VapiProvider.getInstance()
    
    try {
      const call = await vapi.client.credentials.create({
        assistantId,
        phoneNumberId,
        customer: {
          number: phoneNumber,
          numberE164CheckEnabled: false
        }
      })

      return {
        success: true,
        callId: call?.id
      }
  
    } catch (error: any) {
      console.error('Call Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  } catch (error: any) {
    console.error('Call Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
