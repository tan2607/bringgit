import { VoiceProvider, VoiceConfig, ASROptions } from '../types';
import Groq from 'groq-sdk';

export class WhisperProvider implements VoiceProvider {
  private client: Groq;
  private config: VoiceConfig;

  constructor(config: VoiceConfig) {
    if (!config.apiKey) {
      throw new Error('Groq API key is required for Whisper provider');
    }
    this.config = config;
    this.client = new Groq({
      apiKey: config.apiKey,
    });
  }

  async asr(options: ASROptions): Promise<string | ReadableStream<string>> {
    if (options.stream) {
      return this.handleStreamingTranscription(options);
    } else {
      return this.handleBatchTranscription(options);
    }
  }

  private async handleStreamingTranscription(options: ASROptions): Promise<ReadableStream<string>> {
    return new ReadableStream({
      async start(controller) {
        try {
          if (options.audio instanceof ReadableStream) {
            const reader = options.audio.getReader();
            const chunks: Uint8Array[] = [];
            const chunkSize = 30 * 1024; // 30KB chunks
            let currentChunk: Uint8Array[] = [];
            let currentSize = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              currentChunk.push(value);
              currentSize += value.length;

              if (currentSize >= chunkSize || done) {
                const audioBlob = new Blob(currentChunk, { type: 'audio/wav' });
                const text = await this.transcribeChunk(audioBlob, options);
                controller.enqueue(text);

                currentChunk = [];
                currentSize = 0;
              }
            }

            if (currentChunk.length > 0) {
              const audioBlob = new Blob(currentChunk, { type: 'audio/wav' });
              const text = await this.transcribeChunk(audioBlob, options);
              controller.enqueue(text);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  private async handleBatchTranscription(options: ASROptions): Promise<string> {
    const audioData = options.audio instanceof Blob ? options.audio : 
                     new Blob([options.audio], { type: 'audio/wav' });
    
    return await this.transcribeChunk(audioData, options);
  }

  private async transcribeChunk(chunk: Blob, options: ASROptions): Promise<string> {
    try {
      const arrayBuffer = await chunk.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const translation = await this.client.audio.translations.create({
        file: buffer,
        model: "whisper-large-v3",
        prompt: options.prompt || undefined,
        response_format: "text",
        temperature: options.temperature || 0.0
      });

      return translation.text;
    } catch (error) {
      console.error('Error in Groq transcription:', error);
      throw error;
    }
  }

  getSupportedLanguages(): string[] {
    return [
      "en", "zh", "de", "es", "ru", "ko", "fr", "ja", "pt", "tr",
      "pl", "ca", "nl", "ar", "sv", "it", "id", "hi", "fi", "vi",
      "iw", "uk", "el", "ms", "cs", "ro", "da", "hu", "ta", "no",
      "th", "ur", "hr", "bg", "lt", "la", "mi", "ml", "cy", "sk",
      "te", "fa", "lv", "bn", "sr", "az", "sl", "kn", "et", "mk",
      "br", "eu", "is", "hy", "ne", "mn", "bs", "kk", "sq", "sw"
    ];
  }

  async getSupportedVoices(): Promise<string[]> {
    return []; // ASR provider doesn't support voices
  }
}
