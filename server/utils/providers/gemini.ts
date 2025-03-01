import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { definePatientSchema, createExtractionPrompt } from '../variableSchema'
import { patientDataSchema } from '#shared/forms/patientIntakeSchema'
import { describeSchema, extractJsonFromText, validateWithSchema } from '~/utils/schema'
import { extractFHIRFromText, createFHIRExtractionPrompt, defineFHIRPatientSchema, fhirToCallVariables } from '../medplum/mapper'
import type { Bundle } from '../medplum/fhirTypes'
import { validateFhirResource } from '../medplum/client'

interface FileInput {
  buffer: Buffer
  mimeType: string
}

interface PatientSchema {
  description: string
  type: SchemaType
  properties: Record<string, {
    type: SchemaType
    description: string
    nullable: boolean
  }>
  required: string[]
}

export class GeminiOCR {
  private genAI: any
  private model: any
  private readonly schema: PatientSchema

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.schema = this.defineSchema()
    this.model = this.initializeModel(apiKey)
  }

  private initializeModel(apiKey: string) {
    return this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this.schema,
      },
    })
  }

  private defineSchema(): PatientSchema {
    return defineFHIRPatientSchema()
  }

  private fileToGenerativePart(buffer: Buffer, mimeType: string) {
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      },
    }
  }

  // Method to extract call variables from uploaded documents
  async extractCallVariables(files: Array<{ buffer: Buffer, mimeType: string, type: string }>) {
    try {
      // Convert buffers to generative parts
      const imageParts = files.map(file => this.fileToGenerativePart(file.buffer, file.mimeType))
      
      // Create a custom prompt for FHIR data extraction
      const prompt = this.getFHIRExtractionPrompt()
      
      const result = await this.model.generateContent([
        prompt,
        ...imageParts
      ])

      const response = await result.response
      const text = response.text()
      const extractedData = extractJsonFromText(text)
      
      // Convert to FHIR if not already in FHIR format
      const fhirData = extractFHIRFromText(extractedData)
      
      console.log("FHIR data: ", fhirData);
      return fhirToCallVariables(fhirData)
    } catch (error) {
      console.error('Error in FHIR data extraction:', error)
      throw error
    }
  }
  
  // Custom prompt for FHIR data extraction
  private getFHIRExtractionPrompt(): string {
    return createFHIRExtractionPrompt()
  }

  async processDocument(fileBuffer: Buffer, mimeType: string): Promise<any> {
    try {
      // Save buffer to temporary file
      const tempPath = join(tmpdir(), `upload-${Date.now()}`)
      await writeFile(tempPath, fileBuffer)

      // Upload to Gemini
      const file = await this.uploadToGemini(tempPath, mimeType)
      await this.waitForFilesActive([file])

      // Generate schema description for the prompt
      const schemaDescription = describeSchema(BundleSchema)
      const prompt = `
Schema Description:
${schemaDescription}

Task: Using this schema, extract values from the document and output a valid JSON object that matches the schema structure. 
Only include fields that you can confidently extract from the document. For dates, use YYYY-MM-DD format.
For phone numbers, use (XXX) XXX-XXXX format. For addresses, extract street, city, state, and ZIP separately.
      `.trim()

      // Start chat session with specific configuration
      const chatSession = this.model.startChat({
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        }
      })

      // Send the file for processing
      const result = await chatSession.sendMessage([
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
          },
        },
        { text: prompt }
      ])

      // Parse and validate the response
      const responseText = result.response.text()
      const extractedData = extractJsonFromText(responseText)
      
      if (!extractedData) {
        throw new Error('No valid JSON found in response')
      }

      console.log('Extracted data:', extractedData);

      // Validate against schema
      const validation = validateWithSchema(BundleSchema, extractedData)
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error}`)
      }

      return validation.data
    } catch (error: any) {
      console.error('Gemini processing error:', error)
      throw new Error(error.message || 'Failed to process document')
    }
  }
}
