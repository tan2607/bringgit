// pages/api/assistants.ts
import { VapiProvider } from '@/server/utils/providers/vapi';

export default defineEventHandler(async (event) => {
  try {
    const vapiProvider = VapiProvider.getInstance();
    return await vapiProvider.listAssistants();
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch assistants",
    });
  }
});
