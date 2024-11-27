import { TTSOptions, ASROptions, TranslationOptions, VoiceProvider, CartesiaAudioData } from './types';
import { OpenAIVoiceProvider } from './providers/openai';
import { PlayAIProvider } from './providers/playai';
import { CartesiaProvider } from './providers/cartesia';
import { WhisperProvider } from './providers/whisper';

interface ProviderConfig {
  provider: string;
  ttsProvider?: boolean;
  asrProvider?: boolean;
  translationProvider?: boolean;
  default?: boolean;
}

export class VoiceService {
  private ttsProviders: Map<string, VoiceProvider> = new Map();
  private asrProviders: Map<string, VoiceProvider> = new Map();
  private translationProviders: Map<string, VoiceProvider> = new Map();
  private defaultTTSProvider: string = 'cartesia';
  private defaultASRProvider: string = 'whisper';
  private defaultTranslationProvider: string = 'whisper';

  constructor(configs?: ProviderConfig[]) {
    if (configs) {
      // Initialize only specified providers
      for (const providerConfig of configs) {
        this.initializeProvider(providerConfig);
      }
    } else {
      // Initialize all available providers
      this.initializeDefaultProviders();
    }

    // Set default providers based on available providers
    this.setDefaultProviders();
  }

  private initializeProvider(config: ProviderConfig) {
    try {
      let provider: VoiceProvider | null = null;

      switch (config.provider) {
        case 'openai':
          provider = OpenAIVoiceProvider.getInstance();
          if (config.ttsProvider) this.ttsProviders.set('openai', provider);
          if (config.asrProvider) this.asrProviders.set('openai', provider);
          if (config.translationProvider) this.translationProviders.set('openai', provider);
          break;
        case 'play.ai':
          provider = PlayAIProvider.getInstance();
          if (config.ttsProvider) this.ttsProviders.set('play.ai', provider);
          break;
        case 'cartesia':
          provider = CartesiaProvider.getInstance();
          if (config.ttsProvider) this.ttsProviders.set('cartesia', provider);
          break;
        case 'whisper':
          provider = WhisperProvider.getInstance();
          if (config.asrProvider) this.asrProviders.set('whisper', provider);
          if (config.translationProvider) this.translationProviders.set('whisper', provider);
          break;
      }

      // Set as default if specified
      if (config.default && provider) {
        if (config.ttsProvider) this.defaultTTSProvider = config.provider;
        if (config.asrProvider) this.defaultASRProvider = config.provider;
        if (config.translationProvider) this.defaultTranslationProvider = config.provider;
      }
    } catch (error) {
      console.warn(`${config.provider} provider not initialized:`, error);
    }
  }

  private initializeDefaultProviders() {
    // Add OpenAI provider
    try {
      const openai = OpenAIVoiceProvider.getInstance();
      this.ttsProviders.set('openai', openai);
      this.asrProviders.set('openai', openai);
    } catch (error) {
      console.warn('OpenAI provider not initialized');
    }

    // Add PlayAI provider
    try {
      const playai = PlayAIProvider.getInstance();
      this.ttsProviders.set('play.ai', playai);
    } catch (error) {
      console.warn('PlayAI provider not initialized');
    }

    // Add Cartesia provider
    try {
      const cartesia = CartesiaProvider.getInstance();
      this.ttsProviders.set('cartesia', cartesia);
    } catch (error) {
      console.warn('Cartesia provider not initialized');
    }

    // Add Whisper provider
    try {
      const whisper = WhisperProvider.getInstance();
      this.asrProviders.set('whisper', whisper);
      this.translationProviders.set('whisper', whisper);
    } catch (error) {
      console.warn('Whisper provider not initialized');
    }
  }

  private setDefaultProviders() {
    // Set default providers based on available providers
    if (!this.ttsProviders.has(this.defaultTTSProvider)) {
      this.defaultTTSProvider = this.ttsProviders.has('cartesia') ? 'cartesia' : 
                               this.ttsProviders.has('openai') ? 'openai' : 
                               this.ttsProviders.has('play.ai') ? 'play.ai' : 'openai';
    }

    if (!this.asrProviders.has(this.defaultASRProvider)) {
      this.defaultASRProvider = this.asrProviders.has('whisper') ? 'whisper' : 
                               this.asrProviders.has('openai') ? 'openai' : 'whisper';
    }

    if (!this.translationProviders.has(this.defaultTranslationProvider)) {
      this.defaultTranslationProvider = this.translationProviders.has('whisper') ? 'whisper' : 'openai';
    }
  }

  async textToSpeech(
    text: string, 
    options: Omit<TTSOptions, 'text'> = {}, 
    provider?: string
  ): Promise<ArrayBuffer | ReadableStream<Uint8Array> | CartesiaAudioData> {
    const selectedProvider = provider || this.defaultTTSProvider;
    const voiceProvider = this.ttsProviders.get(selectedProvider);

    if (!voiceProvider?.tts) {
      throw new Error(`Provider ${selectedProvider} does not support TTS`);
    }

    console.log('[Voice Service] Using TTS provider:', selectedProvider);
    return await voiceProvider.tts({
      ...options,
      text
    });
  }

  async speechToText(options: ASROptions, provider?: string): Promise<string | ReadableStream<string>> {
    const selectedProvider = provider || this.defaultASRProvider;
    const voiceProvider = this.asrProviders.get(selectedProvider);

    if (!voiceProvider?.asr) {
      throw new Error(`Provider ${selectedProvider} does not support ASR`);
    }

    if (options.audio instanceof Blob && !(options.audio instanceof File)) {
      options.file = new File([options.audio], 'audio.wav', {
        type: options.audio.type || 'audio/wav'
      });
    } else {
      options.file = options.audio as File;
    }

    return await voiceProvider.asr(options);
  }

  async translate(options: TranslationOptions, provider?: string): Promise<string | ReadableStream<string>> {
    const selectedProvider = provider || this.defaultTranslationProvider;
    const voiceProvider = this.translationProviders.get(selectedProvider);

    if (!voiceProvider?.translate) {
      throw new Error(`Provider ${selectedProvider} does not support translation`);
    }

    if (options.audio instanceof Blob && !(options.audio instanceof File)) {
      options.file = new File([options.audio], 'audio.wav', {
        type: options.audio.type || 'audio/wav'
      });
    } else {
      options.file = options.audio as File;
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
