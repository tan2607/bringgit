import { NextRequest } from 'next/server';
import { VoiceService } from '../service';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, options = {}, provider } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceService = new VoiceService([
      {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        ttsProvider: true,
        asrProvider: true,
      },
      {
        provider: "play.ai",
        apiKey: process.env.PLAYAI_API_KEY || "",
        userId: process.env.PLAYAI_USER_ID || "",
        ttsProvider: true,
      },
      {
        provider: "cartesia",
        apiKey: process.env.CARTESIA_API_KEY || "",
        ttsProvider: true,
      },
    ]);

    const audioData = await voiceService.textToSpeech(text, options, provider);

    // If streaming is requested, return a streaming response
    if (options.stream) {
      return new Response(audioData as ReadableStream, {
        headers: {
          'Content-Type': 'audio/opus',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Otherwise return the full audio buffer
    return new Response(audioData as ArrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="audio.mp3"',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
