import { VapiProvider } from '../utils/providers/vapi'

export default defineEventHandler(async (event) => {
  try {

    const vapiProvider = VapiProvider.getInstance();
    const numbers = await vapiProvider.getPhoneNumbers()

    return {
      success: true,
      numbers: numbers.map(number => ({
        id: number.id,
        number: number.number,
        name: number.name || number.number
      }))
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch phone numbers'
    })
  }
})
