// pages/api/calls.ts
import { VapiClient } from "@vapi-ai/server-sdk";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const client = new VapiClient({
    token: config.vapiApiKey,
  });

  let assistants = await client.assistants.list();
  try {
    const calls = await client.calls.list();
    const filteredCalls = calls.map((call) => {
      const duration = (() => {
        const start = new Date(call.startedAt);
        const end = new Date(call.endedAt);
        const diff = (end.getTime() - start.getTime()) / 1000;
        const minutes = Math.floor(diff / 60);
        const seconds = Math.floor(diff % 60);
        return `${minutes}m ${seconds}s`;
      })();

      return {
        id: call.id,
        assistant: assistants.find((assistant) =>
          assistant.id === call.assistantId
        )?.name,
        status: call.status,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration: duration,
        transcript: call.transcript,
        summary: call.summary,
        recordingUrl: call.recordingUrl,
      };
    });
    return filteredCalls;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch calls",
    });
  }
});
