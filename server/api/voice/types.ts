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
}

export interface TTSOptions {
  text: string;
  modelId?: string;
  language?: string;
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
  audio: Blob | ArrayBuffer | ReadableStream;  // Support streaming input
  modelId?: string;
  language?: string | string[];
  codeSwitching?: boolean;
  interim?: boolean;
  punctuation?: boolean;
  diarization?: boolean;
  stream?: boolean;  // Add streaming option
}

// Base provider interface
export interface VoiceProvider {
  tts?(options: TTSOptions): Promise<ArrayBuffer | ReadableStream<Uint8Array>>;
  asr?(options: ASROptions): Promise<string | ReadableStream<string>>;
  getSupportedLanguages(): string[];
  getSupportedVoices(language?: string): Promise<string[]>;
}
