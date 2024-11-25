// pages/api/assistants.ts
import { VapiClient } from "@vapi-ai/server-sdk";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const client = new VapiClient({
    token: config.vapiApiKey,
  });

  try {
    const assistants = await client.assistants.list();
    return assistants.map((assistant) => ({
      id: assistant.id,
      orgId: assistant.orgId,
      createdAt: assistant.createdAt,
      updatedAt: assistant.updatedAt,
      name: assistant.name,
      firstMessage: assistant.firstMessage,
      transcriber: assistant.transcriber,
      model: assistant.model,
      prompt: assistant.model.messages[0].content,
      voice: assistant.voice,
      firstMessageMode: assistant.firstMessageMode,
      hipaaEnabled: assistant.hipaaEnabled,
      clientMessages: assistant.clientMessages,
      serverMessages: assistant.serverMessages,
      silenceTimeoutSeconds: assistant.silenceTimeoutSeconds,
      maxDurationSeconds: assistant.maxDurationSeconds,
      backgroundSound: assistant.backgroundSound,
      backgroundDenoisingEnabled: assistant.backgroundDenoisingEnabled,
      modelOutputInMessagesEnabled: assistant.modelOutputInMessagesEnabled,
      transportConfigurations: assistant.transportConfigurations,
      voicemailDetection: assistant.voicemailDetection,
      voicemailMessage: assistant.voicemailMessage,
      endCallMessage: assistant.endCallMessage,
      endCallPhrases: assistant.endCallPhrases,
      metadata: assistant.metadata,
      artifactPlan: assistant.artifactPlan,
      messagePlan: assistant.messagePlan,
      startSpeakingPlan: assistant.startSpeakingPlan,
      stopSpeakingPlan: assistant.stopSpeakingPlan,
      monitorPlan: assistant.monitorPlan,
      credentialIds: assistant.credentialIds,
      server: assistant.server
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch assistants",
    });
  }
});
