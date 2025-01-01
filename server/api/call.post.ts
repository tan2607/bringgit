import { VapiProvider } from '../utils/providers/vapi'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    let { phoneNumber, assistantId, phoneNumberId } = body

    if (!process.env.VAPI_API_KEY) {
      throw new Error('VAPI API key is not configured')
    }

    if (!assistantId) {
      throw new Error('Assistant ID is required')
    }

    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }

    const vapi = VapiProvider.getInstance()

    // throw new Error('Phone number must be in E.164 format (e.g., +6597599995)')
    // Initialize VAPI provider
    
    
    // Create the call
    // if (phoneNumber.startsWith('+65')) {
    //   phoneNumber = phoneNumber.replace('+65', '')
    //   phoneNumberId = SG_LOCAL_NUMBER;
    // }

    try {
      console.log("Calling number:", phoneNumber, "with ID:", phoneNumberId);
      // let phoneNumberId = SG_PHONE_NUMBER;
      
      // Hard code phoone number for testing
      phoneNumber = '82888399';
  
      const call = await vapi.client.calls.create({
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
