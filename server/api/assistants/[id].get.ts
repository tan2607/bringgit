import { VapiProvider } from '@@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Assistant ID is required'
      })
    }

    const vapiProvider = VapiProvider.getInstance()
    const assistant = await vapiProvider.getAssistant(id)
    
    return assistant
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete assistant'
    })
  }
})
