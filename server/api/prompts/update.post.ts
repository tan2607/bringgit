import { PromptEnhancer } from '~/server/utils/providers/copilot';

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    
    const { originalPrompt, instructions } = body
    
    if (!originalPrompt || !instructions) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields'
      })
    }

    const enhancer = new PromptEnhancer(config.openaiApiKey)
    const updatedPrompt = await enhancer.updatePrompt(originalPrompt, instructions)

    return {
      prompt: updatedPrompt
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update prompt'
    })
  }
})
