import { createError, readBody } from 'h3'
import { z } from 'zod'
import { GeminiOCR } from '../utils/providers/gemini'
import { validateFhirResource } from '../utils/medplum/client'
import { fhirToCallVariables } from '../utils/medplum/mapper'
import type { Bundle } from '../utils/medplum/fhirTypes'

const config = useRuntimeConfig()

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
    const body = await readBody(event)
    
    if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No files provided',
      })
    }
    
    const gemini = new GeminiOCR(config.geminiApiKey)
    // Process the files to extract call variables
    const result = await gemini.extractCallVariables(body.files)
    
    // Handle both the old format and the new FHIR format
    if (result.fhir && result.variables) {
      // This is the new format with both FHIR and application variables
      // Validate the FHIR data
      const validationResult = validateFhirResource(result.fhir)
      if (!validationResult.valid) {
        console.warn('FHIR validation errors:', validationResult.errors)
      }
      
      return {
        fhir: result.fhir,
        variables: result.variables
      }
    } else if (result.resourceType === 'Bundle') {
      // This is a direct FHIR Bundle result
      // Validate the FHIR data
      const validationResult = validateFhirResource(result)
      if (!validationResult.valid) {
        console.warn('FHIR validation errors:', validationResult.errors)
      }
      
      // Convert FHIR to application variables
      const variables = fhirToCallVariables(result as Bundle)
      
      return {
        fhir: result,
        variables
      }
    } else {
      // This is the old format with just variables
      return {
        variables: result
      }
    }
  } catch (error) {
    console.error('Error extracting call variables:', error)
    throw createError({
      statusCode: 500,
      message: `Error extracting call variables: ${(error as Error).message}`,
    })
  }
})
