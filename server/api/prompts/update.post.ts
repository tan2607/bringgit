import { PromptEnhancer } from '@/server/utils/providers/copilot';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { originalPrompt, instructions } = body;

    if (!originalPrompt) {
      throw createError({
        statusCode: 400,
        message: 'Original prompt is required'
      });
    }

    if (!instructions) {
      throw createError({
        statusCode: 400,
        message: 'Enhancement instructions are required'
      });
    }

    const promptEnhancer = new PromptEnhancer(process.env.OPENAI_API_KEY || '');
    
    // Get the enhanced prompt suggestion
    const enhancedPrompt = await promptEnhancer.updatePrompt(originalPrompt, instructions);

    return {
      prompt: enhancedPrompt
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to enhance prompt'
    });
  }
});
