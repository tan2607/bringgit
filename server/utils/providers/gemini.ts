import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { patientDataSchema } from '#shared/forms/patientIntakeSchema'
import { describeSchema, extractJsonFromText, validateWithSchema } from '~/utils/schema'

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
    return {
      description: "Patient data for an intake call",
      type: SchemaType.OBJECT,
      properties: {
        patient: {
          type: SchemaType.OBJECT,
          description: "Patient information",
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "Full name of the patient",
              nullable: false,
            },
            condition: {
              type: SchemaType.STRING,
              description: "Medical conditions of the patient (e.g., diabetes and hypertension)",
              nullable: false,
            },
            address: {
              type: SchemaType.STRING,
              description: "Patient's home address",
              nullable: false,
            },
            lastVisit: {
              type: SchemaType.STRING,
              description: "Patient Visit Date",
              nullable: false,
            },
          },
          nullable: true,
        },
        doctor: {
          type: SchemaType.OBJECT,
          description: "Doctor information",
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "Doctor's full name with title",
              nullable: true,
            },
          },
          nullable: true,
        },
        payment: {
          type: SchemaType.OBJECT,
          description: "Payment information",
          properties: {
            insuranceName: {
              type: SchemaType.STRING,
              description: "Insurance Payor provider name",
              nullable: true,
            },
            insuranceCoverage: {
              type: SchemaType.STRING,
              description: "Coverage percentage",
              nullable: true,
            },
            insurancePrice: {
              type: SchemaType.STRING,
              description: "Price with insurance",
              nullable: true,
            },
            cashPrice: {
              type: SchemaType.STRING,
              description: "Patient Responsibility amount ($)",
              nullable: true,
            },
          },
          nullable: true,
        },
      },
      nullable: false,
    }
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
      
      // Create a custom prompt for call variables extraction
      const prompt = this.getCallVariablesPrompt()
      
      const result = await this.model.generateContent([
        prompt,
        ...imageParts
      ])

      const response = await result.response
      const text = response.text()
      const extractedData = extractJsonFromText(text)
      
      console.log("extractedData: ", extractedData);
      return extractedData
    } catch (error) {
      console.error('Error in call variables extraction:', error)
      throw error
    }
  }
  
  // Custom prompt for call variables extraction
  private getCallVariablesPrompt(): string {
    let prompt = "Please analyze these documents and extract information for a patient call. "
    prompt += `Only include fields that you can confidently extract from the documents. If information is not available, omit that field.`
    return prompt
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
      const schemaDescription = describeSchema(patientDataSchema)
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
      const validation = validateWithSchema(patientDataSchema, extractedData)
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
