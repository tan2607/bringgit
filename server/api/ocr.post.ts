import { createError } from 'h3'
import { readFiles } from 'h3-formidable'
import { GeminiOCR } from '../utils/providers/gemini'
import { readFile } from 'fs/promises'
// import { patientDataSchema } from '~/shared/forms/patientIntakeSchema'

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
    console.log('Processing OCR request...')
    
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

    // Read file buffer
    const fileBuffer = await readFile(file.filepath)

    // Process with Gemini OCR
    const ocr = new GeminiOCR(config.geminiApiKey)
    const extractedData = await ocr.processDocument(fileBuffer, file.mimetype || 'application/octet-stream')

    // Validate extracted data against schema
    // const validatedData = patientDataSchema.safeParse(extractedData)
    const validatedData = extractedData;

    if (!validatedData.success) {
      console.error('Validation errors:', validatedData.error)
      return {
        success: false,
        error: 'Invalid data format',
        details: validatedData.error.errors
      }
    }

    return {
      success: true,
      data: validatedData.data
    }

  } catch (error: any) {
    console.error('OCR Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
