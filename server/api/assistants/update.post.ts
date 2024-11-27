import { VapiProvider } from '@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, prompt } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Assistant ID is required'
      });
    }

    if (!prompt) {
      throw createError({
        statusCode: 400,
        message: 'Prompt is required'
      });
    }

    const vapiProvider = VapiProvider.getInstance();
    const updatedAssistant = await vapiProvider.updateAssistantPrompt(id, prompt);

    return updatedAssistant;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to update assistant'
    });
  }
});
