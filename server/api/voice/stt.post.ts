import { VoiceService } from '../../utils/voice';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { audio, options = {}, provider = 'whisper' } = body;

    if (!audio) {
      throw createError({
        statusCode: 400,
        message: 'Audio data is required',
      });
    }

    const voiceService = new VoiceService();
    return await voiceService.speechToText(audio, options, provider);
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to convert speech to text',
    });
  }
});
