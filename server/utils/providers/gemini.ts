import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { patientIntakeSchema } from '#shared/forms/patientIntakeSchema'

export class GeminiOCR {
  private genAI: any;
  private fileManager: any;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
  }

  private async uploadToGemini(path: string, mimeType: string) {
    const uploadResult = await this.fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    return file;
  }

  private async waitForFilesActive(files: any[]) {
    for (const name of files.map((file) => file.name)) {
      let file = await this.fileManager.getFile(name);
      while (file.state === "PROCESSING") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        file = await this.fileManager.getFile(name);
      }
      if (file.state !== "ACTIVE") {
        throw Error(`File ${file.name} failed to process`);
      }
    }
  }

  async processDocument(fileBuffer: Buffer, mimeType: string): Promise<any> {
    try {
      // Save buffer to temporary file
      const tempPath = join(tmpdir(), `upload-${Date.now()}`);
      await writeFile(tempPath, fileBuffer);

      // Upload to Gemini
      const file = await this.uploadToGemini(tempPath, mimeType);
      await this.waitForFilesActive([file]);

      // Start chat session with specific configuration
      const chatSession = this.model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        }
      });

      // Send the file for processing
      const result = await chatSession.sendMessage([
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
          },
        },
        { text: patientIntakeSchema + "\n\nTask: Using this FormKit Schema, extract values from the document, output as JSON data to fill the form." },
      ]);

      // Parse the response
      const responseText = result.response.text();
      // Extract JSON from the response (removes markdown code blocks if present)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || [null, responseText];
      const jsonStr = jsonMatch[1].trim();
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Gemini processing error:', error);
      throw error;
    }
  }
}
