import { VoiceService } from '../../utils/voice'

export default defineEventHandler(async (event) => {
  try {
    const body = await readMultipartFormData(event)
    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'No form data provided'
      })
    }

    const audioFile = body.find(part => part.name === 'audio')
    const optionsStr = body.find(part => part.name === 'options')?.data.toString()
    const provider = body.find(part => part.name === 'provider')?.data.toString()

    if (!audioFile || !audioFile.data) {
      throw createError({
        statusCode: 400,
        message: 'Audio file is required'
      })
    }

    const options = optionsStr ? JSON.parse(optionsStr) : {}

    const voiceService = new VoiceService([
      {
        provider: 'whisper',
        apiKey: process.env.GROQ_API_KEY || '',
        asrProvider: true,
        translationProvider: true,
      },
      {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        ttsProvider: true,
        asrProvider: true,
        translationProvider: true,
      }
    ])

    const translation = await voiceService.translate({
      audio: audioFile.data,
      ...options,
      targetLanguage: options.targetLanguage || 'en',
      prompt: options.prompt || 'Translate the following audio accurately',
      temperature: options.temperature || 0.0,
      response_format: options.response_format || 'text',
      quality: options.quality || 'standard'
    }, provider)

    return { text: translation }
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
