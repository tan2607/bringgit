import { VoiceService } from '../../utils/voice';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { options = {}, provider = 'whisper' } = body;
    // options.audio needs to be a File object
    if (!options) {
      throw createError({
        statusCode: 400,
        message: 'Options are required',
      });
    }

    const voiceService = new VoiceService();
    return await voiceService.speechToText(options, provider);
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to convert speech to text',
    });
  }
});
