import { VoiceProvider, VoiceConfig, TTSOptions } from '../types';
import { Cartesia, CartesiaClient } from "@cartesia/cartesia-js";
export class CartesiaProvider implements VoiceProvider {
  private static instance: CartesiaProvider;
  private client: CartesiaClient;
  private websocket: any;

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Cartesia requires an API key');
    }
    console.log('[Cartesia] Initializing with API key:', apiKey.substring(0, 5) + '...');
    this.client = new CartesiaClient({
      apiKey,
    });
  }

  public static initialize(apiKey: string): CartesiaProvider {
    if (!CartesiaProvider.instance) {
      CartesiaProvider.instance = new CartesiaProvider(apiKey);
    }
    return CartesiaProvider.instance;
  }

  public static getInstance(): CartesiaProvider {
    if (!CartesiaProvider.instance) {
      throw new Error('CartesiaProvider must be initialized first');
    }
    return CartesiaProvider.instance;
  }

  private async ensureWebSocket() {
    if (!this.websocket) {
      this.websocket = this.client.tts.websocket({
        container: "raw",
        encoding: "pcm_f32le",
        sampleRate: 44100,
      });
      await this.websocket.connect();
    }
    return this.websocket;
  }

  async tts(options: TTSOptions): Promise<any> {
    options.voice = options.voice || "cd954dcd-b2c1-4990-aaaa-4602ed6723df";
    const modelId = this.determineModelId(options.language);
    const sanitizedText = this.sanitizeText(options.text);

    const outputFormat = options.format || "raw";
    const outputFormats = {
      mp3: {
        container: Cartesia.OutputFormatContainer.Mp3,
        bitRate: 128000,
        sampleRate: 44100
      },
      raw: {
        container: Cartesia.OutputFormatContainer.Raw,
        encoding: "pcm_f32le",
        sampleRate: 24000
      },
      wav: {
        container: Cartesia.OutputFormatContainer.Wav,
        encoding: "pcm_f32le",
        sampleRate: 44100
      }
    }

    const requestOptions = {
      modelId: modelId,
      voice: {
        mode: "id" as const,
        id: options.voice,
      },
      outputFormat: outputFormats[outputFormat],
      transcript: sanitizedText,
      language: options.language || "en" as Cartesia.SupportedLanguage,
    };

    console.log('[Cartesia TTS] Request:', JSON.stringify(requestOptions, null, 2));

    try {
      const response = this.client.tts.bytes(requestOptions);
      console.log('[Cartesia TTS] Response received');

      
      return response;
    } catch (error) {
      console.error('[Cartesia TTS] Error:', error);
      throw error;
    }
  }

  async ttsWebsocket(options: TTSOptions): Promise<ArrayBuffer | ReadableStream<Uint8Array>> {
    const websocket = await this.ensureWebSocket();
    options.voice = options.voice || "cd954dcd-b2c1-4990-aaaa-4602ed6723df";
    // Validate language and model compatibility
    const modelId = this.determineModelId(options.language);
    
    // Prevent repeated words issue
    const sanitizedText = this.sanitizeText(options.text);

    const requestOptions = {
      model_id: modelId,
      voice: {
        mode: "id" as const,
        id: options.voice || "default",
        __experimental_controls: {
          speed: this.mapSpeed(options.speed),
          emotion: this.mapEmotions(options),
        },
      },
      transcript: sanitizedText,
      add_timestamps: true,
      language: options.language,
    };

    const response = await websocket.send(requestOptions);

    if (options.stream) {
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const message of response.events('message')) {
              if (message.type === 'audio') {
                controller.enqueue(new Uint8Array(message.data));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
            // Cleanup websocket on error
            websocket.disconnect();
          }
        },
        cancel() {
          // Ensure websocket is cleaned up if stream is cancelled
          websocket.disconnect();
        }
      });
    } else {
      const chunks: Uint8Array[] = [];
      try {
        for await (const message of response.events('message')) {
          if (message.type === 'audio') {
            chunks.push(new Uint8Array(message.data));
          }
        }
        
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        return result.buffer;
      } catch (error) {
        // Cleanup websocket on error
        websocket.disconnect();
        throw error;
      }
    }
  }

  private determineModelId(language?: string): string {
    if (!language || language === 'en') {
      return 'sonic-english';
    }
    
    if (this.getSupportedLanguages().includes(language)) {
      return 'sonic-multilingual';
    }
    
    throw new Error(`Language '${language}' is not supported. Please use one of: ${this.getSupportedLanguages().join(', ')}`);
  }

  private sanitizeText(text: string): string {
    // Handle known issues with repeated words
    const words = text.split(' ');
    const sanitizedWords = words.filter((word, index) => {
      // Keep the word if it's different from the previous word
      return index === 0 || word !== words[index - 1];
    });
    return sanitizedWords.join(' ').trim();
  }

  private mapSpeed(speed: number | undefined): "slowest" | "slow" | "normal" | "fast" | "fastest" {
    if (!speed) return "normal";
    // Adjust speed mapping to mitigate the "fast audio" issue
    if (speed <= 0.5) return "slowest";
    if (speed <= 0.8) return "slow";    // Increased threshold for "slow"
    if (speed <= 1.1) return "normal";  // Narrowed "normal" range
    if (speed <= 1.3) return "fast";    // Reduced "fast" threshold
    return "fastest";
  }

  private mapEmotions(options: TTSOptions): string[] {
    const emotions: string[] = [];
    
    if (options.styleGuidance) {
      if (options.styleGuidance > 0.8) emotions.push("happiness:high");
      else if (options.styleGuidance > 0.5) emotions.push("happiness:medium");
      else emotions.push("neutral");
    }

    return emotions;
  }

  async getSupportedVoices(language?: string): Promise<string[]> {
    try {
      const voices = await this.client.voices.list();
      if (language) {
        // For best performance, filter voices by the same language as the transcript
        return voices
          .filter(voice => voice.language === language)
          .map(voice => voice.id);
      }
      return voices.map(voice => voice.id);
    } catch (error) {
      console.error('Failed to fetch Cartesia voices:', error);
      return [];
    }
  }

  getSupportedLanguages(): string[] {
    // Updated list of supported languages based on Sonic Multilingual capabilities
    return [
      "en",  // English
      "fr",  // French
      "de",  // German
      "es",  // Spanish
      "pt",  // Portuguese
      "zh",  // Chinese
      "ja",  // Japanese
      "hi",  // Hindi
      "it",  // Italian
      "ko",  // Korean
      "nl",  // Dutch
      "pl",  // Polish
      "ru",  // Russian
      "sv",  // Swedish
      "tr"   // Turkish
    ];
  }

  private isNumberOrDate(text: string): boolean {
    // Helper to identify numbers, dates, and phone numbers for special handling
    const numberPattern = /\d+/;
    const datePattern = /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/;
    const phonePattern = /\d{3}[-.)]\d{3}[-.)]\d{4}/;
    
    return numberPattern.test(text) || 
           datePattern.test(text) || 
           phonePattern.test(text);
  }
}
