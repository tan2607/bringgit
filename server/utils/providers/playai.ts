import { VoiceProvider, VoiceConfig, TTSOptions, ASROptions } from "../types";

export class PlayAIProvider implements VoiceProvider {
  private static instance: PlayAIProvider;
  private apiKey: string;
  private userId: string;
  private baseUrl = 'https://api.play.ai/api/v1';

  private constructor(apiKey: string, userId: string) {
    if (!apiKey || !userId) {
      throw new Error('Play.ai requires both apiKey and userId');
    }
    this.apiKey = apiKey;
    this.userId = userId;
  }

  public static initialize(apiKey: string, userId: string): PlayAIProvider {
    if (!PlayAIProvider.instance) {
      PlayAIProvider.instance = new PlayAIProvider(apiKey, userId);
    }
    return PlayAIProvider.instance;
  }

  public static getInstance(): PlayAIProvider {
    if (!PlayAIProvider.instance) {
      throw new Error('PlayAIProvider must be initialized first');
    }
    return PlayAIProvider.instance;
  }

  async tts(options: TTSOptions): Promise<ArrayBuffer | ReadableStream<Uint8Array>> {
    const isDialog = options.modelId?.toLowerCase().includes('dialog');
    const endpoint = `${this.baseUrl}/tts/stream`;

    const requestBody: any = {
      model: options.modelId || (isDialog ? 'PlayDialog' : 'Play3.0-mini'),
      text: options.text,
      voice: options.voice,
      outputFormat: 'mp3',
      speed: options.speed || 1,
      sampleRate: options.sampleRate || 24000,
      seed: options.seed,
      temperature: options.temperature,
      language: options.language || 'english'
    };

    if (isDialog) {
      Object.assign(requestBody, {
        turnPrefix: options.turnPrefix,
        prompt: options.prompt,
        voiceConditioningSeconds: options.voiceConditioningSeconds || 20,
      });
    } else {
      Object.assign(requestBody, {
        quality: options.quality || 'standard',
        textGuidance: options.textGuidance || 1,
        styleGuidance: options.styleGuidance,
        voiceGuidance: options.voiceGuidance,
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'AUTHORIZATION': this.apiKey,
        'X-USER-ID': this.userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Play.ai API error: ${response.statusText}`);
    }

    if (options.stream) {
      return response.body as ReadableStream<Uint8Array>;
    } else {
      return await response.arrayBuffer();
    }
  }

  getSupportedLanguages(): string[] {
    return ["english", "spanish", "french", "german", "italian", "portuguese", "dutch", "polish", "turkish"];
  }

  async getSupportedVoices(language?: string): Promise<string[]> {
    return ["default"];
  }
}
