import { VoiceService } from '../../utils/voice';

export default defineEventHandler(async (event) => {
  try {
    const body = await readMultipartFormData(event);
    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'No form data provided'
      })
    }

    const audioFile = body.find(part => part.name === 'audio');
    const optionsStr = body.find(part => part.name === 'options')?.data.toString();
    const provider = body.find(part => part.name === 'provider')?.data.toString() || 'openai';

    if (!audioFile || !audioFile.data) {
      throw createError({
        statusCode: 400,
        message: 'Audio file is required'
      })
    }

    const options = optionsStr ? JSON.parse(optionsStr) : {};

    const voiceService = new VoiceService([
      {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        ttsProvider: true,
        asrProvider: true,
      },
      {
        provider: 'whisper',
        apiKey: process.env.GROQ_API_KEY || '',
        asrProvider: true,
      },
    ]);

    const transcription = await voiceService.speechToText(audioFile.data, options, provider);

    // If streaming is requested
    if (options.stream && transcription instanceof ReadableStream) {
      setHeader(event, 'Content-Type', 'text/plain');
      setHeader(event, 'Transfer-Encoding', 'chunked');
      return transcription;
    }

    // Return the full transcription
    return { text: transcription };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    });
  }
});
