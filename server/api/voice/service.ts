import { VoiceConfig, TTSOptions, ASROptions, VoiceProvider } from './types';
import { OpenAIVoiceProvider } from './providers/openai';
import { PlayAIProvider } from './providers/playai';
import { CartesiaProvider } from './providers/cartesia';
import { WhisperProvider } from './providers/whisper';

export class VoiceService {
  private ttsProviders: Map<string, VoiceProvider> = new Map();
  private asrProviders: Map<string, VoiceProvider> = new Map();
  private defaultTTSProvider: string;
  private defaultASRProvider: string;

  constructor(configs: VoiceConfig[]) {
    for (const config of configs) {
      this.addProvider(config);
    }
    
    // Set default providers
    this.defaultTTSProvider = configs.find(c => c.ttsProvider !== false)?.provider || "openai";
    this.defaultASRProvider = configs.find(c => c.asrProvider !== false)?.provider || "openai";
  }

  addProvider(config: VoiceConfig): void {
    let provider: VoiceProvider;
    
    switch (config.provider.toLowerCase()) {
      case "openai":
        provider = new OpenAIVoiceProvider(config);
        if (config.ttsProvider !== false) this.ttsProviders.set(config.provider, provider);
        if (config.asrProvider !== false) this.asrProviders.set(config.provider, provider);
        break;
      case "play.ai":
        provider = new PlayAIProvider(config);
        if (config.ttsProvider !== false) this.ttsProviders.set(config.provider, provider);
        break;
      case "cartesia":
        provider = new CartesiaProvider(config);
        if (config.ttsProvider !== false) this.ttsProviders.set(config.provider, provider);
        break;
      case "whisper":
        provider = new WhisperProvider(config);
        if (config.asrProvider !== false) this.asrProviders.set(config.provider, provider);
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  async textToSpeech(text: string, options: Partial<TTSOptions> = {}, provider?: string): Promise<ArrayBuffer | ReadableStream<Uint8Array>> {
    const selectedProvider = this.ttsProviders.get(provider || this.defaultTTSProvider);
    if (!selectedProvider || !selectedProvider.tts) {
      throw new Error("TTS provider not found or doesn't support TTS");
    }

    return await selectedProvider.tts({
      text,
      ...options,
    });
  }

  async speechToText(
    audio: Blob | ArrayBuffer | ReadableStream,
    options: Partial<ASROptions> = {},
    provider?: string
  ): Promise<string | ReadableStream<string>> {
    const selectedProvider = this.asrProviders.get(provider || this.defaultASRProvider);
    if (!selectedProvider || !selectedProvider.asr) {
      throw new Error("ASR provider not found or doesn't support ASR");
    }

    return await selectedProvider.asr({
      audio,
      ...options,
    });
  }

  getTTSProviders(): string[] {
    return Array.from(this.ttsProviders.keys());
  }

  getASRProviders(): string[] {
    return Array.from(this.asrProviders.keys());
  }

  getSupportedLanguages(provider?: string): string[] {
    const selectedProvider = this.ttsProviders.get(provider || this.defaultTTSProvider);
    if (!selectedProvider) {
      throw new Error("Provider not found");
    }

    return selectedProvider.getSupportedLanguages();
  }

  async getSupportedVoices(language?: string, provider?: string): Promise<string[]> {
    const selectedProvider = this.ttsProviders.get(provider || this.defaultTTSProvider);
    if (!selectedProvider) {
      throw new Error("Provider not found");
    }

    return await selectedProvider.getSupportedVoices(language);
  }

  getAvailableProviders(): string[] {
    return Array.from(new Set([...this.ttsProviders.keys(), ...this.asrProviders.keys()]));
  }
}
