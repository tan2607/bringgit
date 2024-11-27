import OpenAI from "openai";
import { VoiceProvider, VoiceConfig, TTSOptions, ASROptions } from "../types";

export class OpenAIVoiceProvider implements VoiceProvider {
  private static instance: OpenAIVoiceProvider;
  private client: OpenAI;
  private config: VoiceConfig;

  private constructor(apiKey: string) {
    this.config = {
      provider: 'openai',
      apiKey
    };
    this.client = new OpenAI({
      apiKey,
    });
  }

  public static initialize(apiKey: string): OpenAIVoiceProvider {
    if (!OpenAIVoiceProvider.instance) {
      OpenAIVoiceProvider.instance = new OpenAIVoiceProvider(apiKey);
    }
    return OpenAIVoiceProvider.instance;
  }

  public static getInstance(): OpenAIVoiceProvider {
    if (!OpenAIVoiceProvider.instance) {
      throw new Error('OpenAIVoiceProvider must be initialized first');
    }
    return OpenAIVoiceProvider.instance;
  }

  async tts(options: TTSOptions): Promise<ArrayBuffer | ReadableStream<Uint8Array>> {
    const response = await this.client.audio.speech.create({
      model: options.modelId || "tts-1",
      voice: options.voice as OpenAI.Audio.Speech.SpeechCreateParams["voice"] || "alloy",
      input: options.text,
      response_format: options.stream ? "opus" : "mp3",
      speed: options.speed,
    });

    if (options.stream) {
      return response.body ?? new ReadableStream<Uint8Array>();
    } else {
      return await response.arrayBuffer();
    }
  }

  async asr(options: ASROptions): Promise<string | ReadableStream<string>> {
    if (options.stream) {
      return new ReadableStream({
        async start(controller) {
          try {
            if (options.audio instanceof ReadableStream) {
              const reader = options.audio.getReader();
              const chunks: Uint8Array[] = [];
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const result = await this.processAudioChunk(blob, options);
                controller.enqueue(result);
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
    } else {
      const response = await this.client.audio.transcriptions.create({
        file: new File([options.audio], "audio.wav", { type: "audio/wav" }),
        model: options.modelId || "whisper-1",
        language: Array.isArray(options.language) ? options.language[0] : options.language,
        response_format: "verbose_json",
      });

      return response.text;
    }
  }

  private async processAudioChunk(chunk: Blob, options: ASROptions): Promise<string> {
    const response = await this.client.audio.transcriptions.create({
      file: new File([chunk], "chunk.wav", { type: "audio/wav" }),
      model: options.modelId || "whisper-1",
      language: Array.isArray(options.language) ? options.language[0] : options.language,
      response_format: "verbose_json",
    });

    return response.text;
  }

  getSupportedLanguages(): string[] {
    return ["en", "zh", "de", "es", "ru", "ko", "fr", "ja", "pt", "tr", "pl", "ca", "nl", "ar", "sv", "it", "id", "hi", "fi", "vi", "iw", "uk", "el", "ms", "cs", "ro", "da", "hu", "ta", "no", "th", "ur", "hr", "bg", "lt", "la", "mi", "ml", "cy", "sk", "te", "fa", "lv", "bn", "sr", "az", "sl", "kn", "et", "mk", "br", "eu", "is", "hy", "ne", "mn", "bs", "kk", "sq", "sw", "gl", "mr", "pa", "si", "km", "sn", "yo", "so", "af", "oc", "ka", "be", "tg", "sd", "gu", "am", "yi", "lo", "uz", "fo", "ht", "ps", "tk", "nn", "mt", "sa", "lb", "my", "bo", "tl", "mg", "as", "tt", "haw", "ln", "ha", "ba", "jw", "su"];
  }

  async getSupportedVoices(language?: string): Promise<string[]> {
    return ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  }
}
