import { NextRequest } from 'next/server';
import { VoiceService } from '../service';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const optionsStr = formData.get('options') as string;
    const provider = formData.get('provider') as string;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'Audio file is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const options = optionsStr ? JSON.parse(optionsStr) : {};

    const voiceService = new VoiceService([
      {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        ttsProvider: true,
        asrProvider: true,
      },
      {
        provider: "whisper",
        apiKey: process.env.GROQ_API_KEY || "",
        asrProvider: true,
      },
    ]);

    const audioBuffer = await audioFile.arrayBuffer();
    const transcription = await voiceService.speechToText(audioBuffer, options, provider);

    // If streaming is requested
    if (options.stream && transcription instanceof ReadableStream) {
      return new Response(transcription, {
        headers: {
          'Content-Type': 'text/plain',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Return the full transcription
    return new Response(JSON.stringify({ text: transcription }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
