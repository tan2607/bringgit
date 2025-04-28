import { VapiProvider } from '@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, prompt, model, voiceModel, transcriberModel, transcriberLanguage } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Assistant ID is required'
      });
    }

    // If updating prompt only, use the specific method
    if (prompt && !model && !voiceModel && !transcriberModel && !transcriberLanguage) {
      const vapiProvider = VapiProvider.getInstance();
      const updatedAssistant = await vapiProvider.updateAssistantPrompt(id, prompt);
      return updatedAssistant;
    }
    
    // Handle more complex updates with multiple fields
    const vapiProvider = VapiProvider.getInstance();
    
    // Get current assistant data to build the update
    const currentAssistant = await vapiProvider.getAssistant(id);
    const updateData: any = {};
    
    // Handle model updates
    if (model) {
      updateData.model = {
        ...currentAssistant.model,
        model: model
      };
    }
    
    // Handle voice updates
    if (voiceModel) {
      updateData.voice = {
        ...currentAssistant.voice,
        model: voiceModel
      };
    }
    
    // Handle transcriber updates
    if (transcriberModel || transcriberLanguage) {
      updateData.transcriber = {
        ...currentAssistant.transcriber,
        ...(transcriberModel ? { model: transcriberModel } : {}),
        ...(transcriberLanguage ? { language: transcriberLanguage } : {})
      };
    }
    
    // If prompt is also included, update it
    if (prompt) {
      if (!updateData.model) {
        updateData.model = { ...currentAssistant.model };
      }
      updateData.model.messages = [
        {
          role: 'system',
          content: prompt
        }
      ];
    }
    
    const updatedAssistant = await vapiProvider.updateAssistant(id, updateData);
    return updatedAssistant;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to update assistant'
    });
  }
});
