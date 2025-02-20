import { VapiClient } from "@vapi-ai/server-sdk";
import { gte } from 'drizzle-orm';
import { jobs } from '~/server/database/schema';

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
      prompt: assistant.model?.messages?.[0]?.content ?? '',
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

  async getPhoneNumbers() {
    return await this.client.phoneNumbers.list();
  }

  async createAssistant(data: any) {
    return await this.client.assistants.create(data);
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
  async listCalls(params?: {
    createdAtGe?: string;
    createdAtLe?: string;
    limit?: number;
  }) {
    const [calls, assistants] = await Promise.all([
      this.client.calls.list({
        ...params,
        limit: params?.limit || 100
      }),
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

      const structuredData: Record<string, any> =
        call.analysis && call.analysis.structuredData ? call.analysis.structuredData : {}
      const tagList = Object.keys(structuredData)
        .filter((key) => typeof structuredData[key] !== 'object')
        .map((key) => `${key}: ${structuredData[key]}`)

      return {
        id: call.id,
        assistant: assistants.find((assistant) =>
          assistant.id === call.assistantId
        )?.name,
        customer: call.customer,
        messages: call.messages,
        status: call.status,
        createdAt: call.createdAt,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration: duration,
        transcript: (call as any).transcript ?? '',
        summary: (call as any).summary ?? '',
        recordingUrl: (call as any).recordingUrl ?? '',
        structuredData,
        tags: tagList,
        assistantOverrides: call.assistantOverrides,
        endedReason: call.endedReason
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

    const db = useDrizzle();
    // Find all and count jobs for last 7 days
    const allJobs = await db.query.jobs.findMany({
      where: and(gte(jobs.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))),
    });

    const calls = analytics.find((a) => a.name === "calls");

    return {
      calls,
      timeRange: calls?.timeRange!,
      jobs: allJobs.length,
    };
  }
}
