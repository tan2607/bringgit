import { VoiceConfig, TTSOptions, ASROptions, TranslationOptions, VoiceProvider } from './types';
import { OpenAIVoiceProvider } from './providers/openai';
import { PlayAIProvider } from './providers/playai';
import { CartesiaProvider } from './providers/cartesia';
import { WhisperProvider } from './providers/whisper';

export class VoiceService {
  private ttsProviders: Map<string, VoiceProvider> = new Map();
  private asrProviders: Map<string, VoiceProvider> = new Map();
  private translationProviders: Map<string, VoiceProvider> = new Map();
  private defaultTTSProvider: string;
  private defaultASRProvider: string;
  private defaultTranslationProvider: string;

  constructor(configs: VoiceConfig[]) {
    for (const config of configs) {
      this.addProvider(config);
    }
    
    // Set default providers
    this.defaultTTSProvider = configs.find(c => c.ttsProvider !== false)?.provider || "openai";
    this.defaultASRProvider = configs.find(c => c.asrProvider !== false)?.provider || "openai";
    this.defaultTranslationProvider = configs.find(c => c.translationProvider !== false)?.provider || "whisper";
  }

  private addProvider(config: VoiceConfig) {
    let provider: VoiceProvider;

    switch (config.provider) {
      case 'openai':
        provider = new OpenAIVoiceProvider(config);
        break;
      case 'play.ai':
        provider = new PlayAIProvider(config);
        break;
      case 'cartesia':
        provider = new CartesiaProvider(config);
        break;
      case 'whisper':
        provider = new WhisperProvider(config);
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    if (config.ttsProvider !== false && provider.tts) {
      this.ttsProviders.set(config.provider, provider);
    }
    if (config.asrProvider !== false && provider.asr) {
      this.asrProviders.set(config.provider, provider);
    }
    if (config.translationProvider !== false && provider.translate) {
      this.translationProviders.set(config.provider, provider);
    }
  }

  async textToSpeech(text: string, options: Omit<TTSOptions, 'text'> = {}, provider?: string): Promise<ArrayBuffer | ReadableStream<Uint8Array>> {
    const selectedProvider = provider || this.defaultTTSProvider;
    const voiceProvider = this.ttsProviders.get(selectedProvider);

    if (!voiceProvider?.tts) {
      throw new Error(`Provider ${selectedProvider} does not support TTS`);
    }

    return await voiceProvider.tts({ ...options, text });
  }

  async speechToText(audio: Blob | ArrayBuffer | ReadableStream<Uint8Array>, options: Omit<ASROptions, 'audio'> = {}, provider?: string): Promise<string | ReadableStream<string>> {
    const selectedProvider = provider || this.defaultASRProvider;
    const voiceProvider = this.asrProviders.get(selectedProvider);

    if (!voiceProvider?.asr) {
      throw new Error(`Provider ${selectedProvider} does not support ASR`);
    }

    return await voiceProvider.asr({ ...options, audio });
  }

  async translate(options: TranslationOptions, provider?: string): Promise<string | ReadableStream<string>> {
    const selectedProvider = provider || this.defaultTranslationProvider;
    const voiceProvider = this.translationProviders.get(selectedProvider);

    if (!voiceProvider?.translate) {
      throw new Error(`Provider ${selectedProvider} does not support translation`);
    }

    return await voiceProvider.translate(options);
  }

  getSupportedLanguages(provider?: string): string[] {
    if (provider) {
      const voiceProvider = this.ttsProviders.get(provider) || 
                          this.asrProviders.get(provider) ||
                          this.translationProviders.get(provider);
      if (!voiceProvider) {
        throw new Error(`Provider ${provider} not found`);
      }
      return voiceProvider.getSupportedLanguages();
    }

    // Combine languages from all providers
    const languages = new Set<string>();
    for (const provider of [...this.ttsProviders.values(), ...this.asrProviders.values(), ...this.translationProviders.values()]) {
      provider.getSupportedLanguages().forEach(lang => languages.add(lang));
    }
    return Array.from(languages);
  }

  async getSupportedVoices(provider?: string, language?: string): Promise<string[]> {
    if (provider) {
      const voiceProvider = this.ttsProviders.get(provider);
      if (!voiceProvider) {
        throw new Error(`TTS Provider ${provider} not found`);
      }
      return voiceProvider.getSupportedVoices(language);
    }

    // Combine voices from all TTS providers
    const voices = new Set<string>();
    for (const provider of this.ttsProviders.values()) {
      const providerVoices = await provider.getSupportedVoices(language);
      providerVoices.forEach(voice => voices.add(voice));
    }
    return Array.from(voices);
  }
}
