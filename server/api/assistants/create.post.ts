import { VapiProvider } from '@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const vapiProvider = VapiProvider.getInstance();

    delete body.prompt;
    delete body.orgId;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.isServerUrlSecretSet;
    
    // Create new assistant using the VAPI client
    const newAssistant = await vapiProvider.client.assistants.create(body);
    
    return newAssistant;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to create assistant'
    });
  }
});
