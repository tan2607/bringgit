import { VoiceService } from '../../utils/voice'

export default defineEventHandler(async (event) => {
  try {
    const body = await readFormData(event)
    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'No form data provided'
      })
    }

    // Log form data entries
    console.log('Form data entries:');
    for (const [key, value] of body.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          type: 'File',
          name: value.name,
          size: value.size,
          type: value.type
        });
      } else {
        console.log(`${key}:`, value);
      }
    }

    const audioFile = body.get('audio') as File
    const optionsStr = body.get('options') as string
    const provider = body.get('provider') as string

    // Log parsed options
    if (optionsStr) {
      console.log('Translation options:', JSON.parse(optionsStr));
    }

    if (!audioFile) {
      throw createError({
        statusCode: 400,
        message: 'Audio file is required'
      })
    }

    const options = optionsStr ? JSON.parse(optionsStr) : {}

    const voiceService = new VoiceService()

    console.log('Voice translation options:', options)
    const transcriptionPromise = voiceService.speechToText({
      audio: audioFile,
      ...options,
      targetLanguage: options.targetLanguage || 'en',
      prompt: options.prompt || 'Translate the following audio accurately',
      temperature: options.temperature || 0.0,
      response_format: options.response_format || 'text',
      quality: options.quality || 'standard'
    }, provider)

    const translationPromise = voiceService.translate({
      audio: audioFile,
      ...options,
      targetLanguage: options.targetLanguage || 'en',
      prompt: options.prompt || 'Translate the following audio accurately',
      temperature: options.temperature || 0.0,
      response_format: options.response_format || 'text',
      quality: options.quality || 'standard'
    }, provider)

    const [sourceText, translatedText] = await Promise.all([transcriptionPromise, translationPromise])
    return { sourceText, translatedText }
  } catch (error) {
    console.error('Voice translation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
