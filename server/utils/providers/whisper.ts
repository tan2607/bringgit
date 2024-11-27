/**
 * WhisperProvider class for speech-to-text and translation services.
 * Note: Translation is only supported FROM any language TO English.
 */
import { VoiceProvider, VoiceConfig, ASROptions, TranslationOptions } from '../types';
import Groq from 'groq-sdk';

export class WhisperProvider implements VoiceProvider {
  private static instance: WhisperProvider;
  private client: Groq;

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Groq API key is required for Whisper provider');
    }
    this.client = new Groq({
      apiKey,
    });
  }

  public static initialize(apiKey: string): WhisperProvider {
    if (!WhisperProvider.instance) {
      WhisperProvider.instance = new WhisperProvider(apiKey);
    }
    return WhisperProvider.instance;
  }

  public static getInstance(): WhisperProvider {
    if (!WhisperProvider.instance) {
      throw new Error('WhisperProvider must be initialized first');
    }
    return WhisperProvider.instance;
  }

  async asr(options: ASROptions): Promise<string | ReadableStream<string>> {
    try {
      let fileToUpload: File;
      if (options.audio instanceof Blob && !(options.audio instanceof File)) {
        fileToUpload = new File([options.audio], 'audio.wav', {
          type: options.audio.type || 'audio/wav'
        });
      } else {
        fileToUpload = options.audio as File;
      }

      const transcriptions = await this.client.audio.transcriptions.create({
        file: fileToUpload,
        model: "whisper-large-v3-turbo",
        // prompt: options.prompt || undefined,
        response_format: "text",
        temperature: options.temperature || 0.0
      });

      console.log('[Groq] transcriptions:', transcriptions);
      return transcriptions;
    } catch (error) {
      console.error('Error in Groq translation:', error);
      throw error;
    }
  }


  /**
   * Translates audio content from any language to English.
   * Note: This method only supports translation TO English. For other target languages,
   * use ASR + text translation instead.
   * @param options Translation options
   * @returns Translated text in English
   */
  async translate(options: TranslationOptions): Promise<string> {
    try {
      // Note: translations.create only translates to English
      const translation = await this.client.audio.translations.create({
        file: options.audio,
        model: "whisper-large-v3",
        prompt: options.prompt || undefined,
        response_format: "text",
        temperature: options.temperature || 0.0
      });

      return translation;
    } catch (error) {
      console.error('Error in Groq translation:', error);
      throw error;
    }
  }

  /**
   * Returns list of supported source languages for translation.
   * Note: Target language is always English for translations.
   */
  getSupportedLanguages(): string[] {
    return [
      'ar', 'bg', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 
      'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'ms', 
      'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'th', 
      'tr', 'uk', 'ur', 'vi', 'zh'
    ];
  }

  async getSupportedVoices(): Promise<string[]> {
    return []; // ASR provider doesn't support voices
  }
}
