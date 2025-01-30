import { Cartesia } from "@cartesia/cartesia-js";
import OpenAI from "openai";

// Types for voice service configuration
export interface VoiceConfig {
  provider: string;
  apiKey: string;
  userId?: string;  // Required for Play.ai
  modelId?: string;
  language?: string | string[];
  region?: string;
  codeSwitching?: boolean;
  ttsProvider?: boolean;  // Indicates if provider supports TTS
  asrProvider?: boolean;  // Indicates if provider supports ASR
  translationProvider?: boolean;  // Indicates if provider supports translation
}

export interface TTSOptions {
  format: 'raw' | 'mp3' | 'wav';
  text: string;
  modelId?: string;
  language?: Cartesia.SupportedLanguage;
  voice?: string;
  speed?: number;
  pitch?: number;
  stream?: boolean;
  quality?: 'draft' | 'standard' | 'high';  // Play.ai specific
  sampleRate?: number;
  seed?: number;
  temperature?: number;
  textGuidance?: number;
  styleGuidance?: number;
  voiceGuidance?: number;
  turnPrefix?: string;  // For Play.ai dialog
  prompt?: string;
  voiceConditioningSeconds?: number;
}

export interface ASROptions {
  audio: Blob | ArrayBuffer | ReadableStream<Uint8Array>;  // Support streaming input
  modelId?: string;
  language?: string | string[];
  codeSwitching?: boolean;
  interim?: boolean;
  punctuation?: boolean;
  diarization?: boolean;
  stream?: boolean;
  prompt?: string;
  temperature?: number;
  response_format?: 'text' | 'verbose_json';
}

export interface TranslationOptions extends ASROptions {
  targetLanguage?: string;
  sourceLanguage?: string;
  quality?: 'draft' | 'standard' | 'high';
  preserveFormatting?: boolean;
  formality?: 'formal' | 'informal';
}

export interface CartesiaAudioData {
  audio: {
    buffer: Float32Array;
    sampleRate: number;
    bufferDuration: number;
  };
  metadata: {
    container: string;
    encoding: string;
    sampleRate: number;
  };
}

// Base provider interface
export interface VoiceProvider {
  tts?: (options: TTSOptions) => Promise<ArrayBuffer | ReadableStream<Uint8Array> | CartesiaAudioData>;
  asr?: (options: ASROptions) => Promise<string | ReadableStream<string>>;
  translate?: (options: TranslationOptions) => Promise<string | ReadableStream<string>>;
  getSupportedLanguages?: () => string[];
  getSupportedVoices?: (language?: string) => Promise<string[]>;
}
