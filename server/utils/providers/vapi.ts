import { VapiClient } from "@vapi-ai/server-sdk";

export class VapiProvider {
  private static instance: VapiProvider;
  private client: VapiClient;

  private constructor(apiKey: string) {
    this.client = new VapiClient({
      token: apiKey,
    });
  }

  public static initialize(apiKey: string): VapiProvider {
    if (!VapiProvider.instance) {
      VapiProvider.instance = new VapiProvider(apiKey);
    }
    return VapiProvider.instance;
  }

  public static getInstance(): VapiProvider {
    if (!VapiProvider.instance) {
      throw new Error('VapiProvider not initialized. Call initialize() first.');
    }
    return VapiProvider.instance;
  }

  // Assistant Methods
  async listAssistants() {
    const assistants = await this.client.assistants.list();
    return assistants.map((assistant) => ({
      id: assistant.id,
      orgId: assistant.orgId,
      createdAt: assistant.createdAt,
      updatedAt: assistant.updatedAt,
      name: assistant.name,
      firstMessage: assistant.firstMessage,
      transcriber: assistant.transcriber,
      model: assistant.model,
      prompt: assistant.model?.messages?[0].content,
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
      credentialIds: assistant.credentialIds
    }));
  }

  async getAssistant(id: string) {
    return await this.client.assistants.get(id);
  }

  async updateAssistant(id: string, data: any) {
    return await this.client.assistants.update(id, data);
  }

  async updateAssistantPrompt(id: string, prompt: string) {
    // Get the current assistant to preserve other settings
    const assistant = await this.client.assistants.get(id);
    
    // Update the assistant with the new prompt
    return await this.client.assistants.update(id, {
      model: {
        ...assistant.model!,
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ]
      }
    });
  }

  // Call Methods
  async listCalls() {
    const [calls, assistants] = await Promise.all([
      this.client.calls.list(),
      this.client.assistants.list()
    ]);

    return calls.map((call) => {
      const duration = (() => {
        const start = new Date(call.startedAt ?? new Date());
        const end = new Date(call.endedAt ?? new Date());
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
  }

  // Raw client access if needed
  getClient(): VapiClient {
    return this.client;
  }

  // Analytics Methods
  async getAnalytics() {
    const analytics = await this.client.analytics.get({
      queries: [{
        table: "call",
        name: "calls",
        operations: [{
          operation: "count",
          column: "id",
        }, 
        {
          operation: "avg",
          column: "duration",
        },
        {
          operation: "sum",
          column: "cost",
        }, {
          operation: "avg",
          column: "cost",
        }],
      }],
    });

    const calls = analytics.find((a) => a.name === "calls");
    return {
      calls,
      timeRange: calls?.timeRange!
    };
  }
}
