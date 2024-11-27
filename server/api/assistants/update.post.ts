import { VapiClient } from "@vapi-ai/server-sdk";

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

    const client = new VapiClient(process.env.VAPI_API_KEY);
    
    // Get current assistant to preserve other message properties
    const currentAssistant = await client.assistants.get(id);
    const messages = currentAssistant.model.messages.map((msg: any, index: number) => 
      index === 0 ? { ...msg, content: prompt } : msg
    );

    const updatedAssistant = await client.assistants.update(id, {
      model: {
        messages
      }
    });

    // Return the simplified assistant object with prompt extracted
    return {
      ...updatedAssistant,
      prompt: updatedAssistant.model.messages[0].content
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to update assistant'
    });
  }
});
