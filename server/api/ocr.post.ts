import { createError } from 'h3'
import { readFiles } from 'h3-formidable'
import { GeminiOCR } from '../utils/providers/gemini'
import { readFile } from 'fs/promises'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp'
]

export default defineEventHandler(async (event) => {
  try {
    console.log('Processing OCR request...');
    
    // Parse multipart form data
    const { files } = await readFiles(event, {
      includeFields: true
    })

    if (!files?.file) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded',
      })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        message: 'File size exceeds 5MB limit',
      })
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype || 'application/octet-stream')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file type. Supported formats: PDF, JPEG, PNG, TIFF, BMP',
      })
    }

    const config = useRuntimeConfig()
    if (!config.geminiApiKey) {
      throw createError({
        statusCode: 500,
        message: 'Gemini API key not configured',
      })
    }

    // Read file content
    const fileContent = await readFile(file.filepath)

    const geminiOcr = new GeminiOCR(config.geminiApiKey)
    const result = await geminiOcr.processDocument(fileContent, file.mimetype)
    console.log('OCR result:', result);
    return result
  } catch (error: any) {
    console.error('OCR processing error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process document',
    })
  }
})
