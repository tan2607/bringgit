import { VoiceProvider, VoiceConfig, TTSOptions, ASROptions } from "../types";

export class PlayAIProvider implements VoiceProvider {
  private apiKey: string;
  private userId: string;
  private baseUrl = 'https://api.play.ai/api/v1';

  constructor(config: VoiceConfig) {
    if (!config.apiKey || !config.userId) {
      throw new Error('Play.ai requires both apiKey and userId');
    }
    this.apiKey = config.apiKey;
    this.userId = config.userId;
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
