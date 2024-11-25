import { defineEventHandler, readBody, createError, setHeader } from 'h3';
import { VoiceService } from '../../../utils/voice';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { text, options = {}, provider } = body;

    if (!text) {
      throw createError({
        statusCode: 400,
        message: 'Text is required',
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
    if (options.stream && audioData instanceof ReadableStream) {
      setHeader(event, 'Content-Type', 'audio/opus');
      setHeader(event, 'Transfer-Encoding', 'chunked');
      return audioData;
    }

    // Otherwise return the full audio buffer
    setHeader(event, 'Content-Type', 'audio/mpeg');
    setHeader(event, 'Content-Disposition', 'attachment; filename="audio.mp3"');
    return audioData;
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error',
    });
  }
});
