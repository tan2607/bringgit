import { VoiceService } from '../../utils/voice';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { text, options = {}, provider = 'cartesia' } = body;

    if (!text) {
      throw createError({
        statusCode: 400,
        message: 'Text is required',
      });
    }

    const voiceService = new VoiceService([
      {
        provider: "openai",
        ttsProvider: true,
        asrProvider: true,
      },
      {
        provider: "play.ai",
        ttsProvider: true,
      },
      {
        provider: "cartesia",
        ttsProvider: true,
      },
    ]);

    const response = await voiceService.textToSpeech(text, options, provider);

    // For Cartesia, return raw buffer directly
    if (provider === 'cartesia') {
      setHeader(event, 'Content-Type', 'application/octet-stream');
      setHeader(event, 'Accept-Ranges', 'bytes');
      
      // Convert ArrayBuffer to Buffer for proper transmission
      const buffer = Buffer.from(response);
      setHeader(event, 'Content-Length', buffer.length.toString());
      
      return buffer;
    }

    throw createError({
      statusCode: 400,
      message: 'Unsupported provider',
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to convert text to speech',
    });
  }
});
