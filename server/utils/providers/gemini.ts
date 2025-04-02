// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/genai"
// import { GoogleAIFileManager } from "@google/genai/server"
import { tmpdir } from 'os'
import { patientDataSchema } from '#shared/forms/patientIntakeSchema'
import { describeSchema, extractJsonFromText, validateWithSchema } from '~/utils/schema'
import {GoogleGenAI, ContentListUnion} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

// Simple in-memory cache to avoid repeated identical queries
const responseCache = new Map<string, { response: string, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

export async function askMedication(query: string, context: string) {
  try {
    // Add the file to the contents.
    const contents: ContentListUnion = [
      {
        parts: [{
          text: context,
        },
        {
          text: `Answer the user question strictly based on the information provided. You will be graded on comprehensiveness and accuracy. If the information is not available in the provided content, say so clearly. Format your response in markdown with appropriate headings, bullet points, and emphasis. Always use full url in citation at the end of response. HealthHub Reference: https://www.healthhub.sg/a-z/medications/{url_slug}`
        }],
        role: "model"
      },
      {
        parts: [{
          text: query
        }],
        role: "user"
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      generationConfig: {
        temperature: 0.1, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error in askMedication:', error);
    throw new Error(`Failed to get medication information: ${error.message || 'Unknown error'}`);
  }
}

export async function askGemini(prompt: string, model = 'gemini-2.0-flash') {
  try {
    // Add the file to the contents.
    const contents: ContentListUnion = [
      {
        parts: [{
          text: prompt
        }],
        role: "user"
      }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      generationConfig: {
        temperature: 0.1, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error in askGemini:', error);
    throw new Error(`Failed to get medication information: ${error.message || 'Unknown error'}`);
  }
}

export class GeminiOCR {
  private genAI: any
  private fileManager: any
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.fileManager = new GoogleAIFileManager(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })
  }

  private async uploadToGemini(path: string, mimeType: string) {
    const uploadResult = await this.fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    })
    const file = uploadResult.file
    return file
  }

  private async waitForFilesActive(files: any[]) {
    for (const name of files.map((file) => file.name)) {
      let file = await this.fileManager.getFile(name)
      while (file.state === "PROCESSING") {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        file = await this.fileManager.getFile(name)
      }
      if (file.state !== "ACTIVE") {
        throw Error(`File ${file.name} failed to process`)
      }
    }
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
