import Groq from "groq-sdk";
import { z } from "zod";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Groq model configurations
const GROQ_MODELS = {
  speech: "whisper-large-v3-turbo",
  translation: "whisper-large-v3",
  text: "llama-3.2-90b-text-preview"
}

// Zod schema for input validation
const VoiceInputSchema = z.object({
  audio: z.instanceof(File),
  sourceLanguage: z.string(),
  targetLanguage: z.string()
});

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate input
    const formData = await readMultipartFormData(event);
    if (!formData) {
      throw createError({ 
        statusCode: 400, 
        message: "No form data received" 
      });
    }

    // Extract audio file and language details
    const audioFile = formData.find(part => part.name === 'audio')?.data;
    const sourceLanguage = formData.find(part => part.name === 'sourceLanguage')?.data.toString();
    const targetLanguage = formData.find(part => part.name === 'targetLanguage')?.data.toString();

    if (!audioFile || !sourceLanguage || !targetLanguage) {
      throw createError({ 
        statusCode: 400, 
        message: "Missing required parameters" 
      });
    }

    // Transcribe audio
    const { text: transcribedText } = await groq.audio.transcriptions.create({
      file: new File([audioFile], 'audio.wav'),
      model: GROQ_MODELS.speech,
      language: sourceLanguage || 'en',
      prompt: "Transcribe clearly, handle medical and technical terminology"
    });

    // Translate text
    const { choices } = await groq.chat.completions.create({
      model: GROQ_MODELS.text,
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Preserve the original meaning and context.`
        },
        {
          role: "user",
          content: transcribedText
        }
      ]
    });

    const translatedText = choices[0].message.content || "Translation failed";

    // Optional: Text-to-Speech (you may want to use a different service)
    let audioResponse;
    try {
      audioResponse = await fetch("https://api.cartesia.ai/tts/bytes", {
        method: "POST",
        headers: {
          "Cartesia-Version": "2024-06-10",
          "Content-Type": "application/json",
          "X-API-Key": process.env.CARTESIA_API_KEY!,
        },
        body: JSON.stringify({
          model_id: targetLanguage === 'en' ? "sonic-english" : "sonic-multilingual",
          transcript: translatedText,
          voice: {
            mode: "embedding",
            embedding: { /* You might want to select a voice based on target language */ },
            __experimental_controls: {
              speed: "normal",
              emotion: ["neutral"],
            },
          },
          output_format: {
            container: "raw",
            encoding: "pcm_f32le",
            sample_rate: 24000,
          },
          streaming: true  // Enable streaming
        })
      });
    } catch (ttsError) {
      console.error("TTS generation failed:", ttsError);
      audioResponse = null;
    }

    // Return response
    return {
      transcript: transcribedText,
      translation: translatedText,
      audioStream: audioResponse && audioResponse.ok ? audioResponse.body : null
    };

  } catch (error) {
    console.error("Voice translation error:", error);
    throw createError({ 
      statusCode: 500, 
      message: error instanceof Error ? error.message : "Unknown error occurred" 
    });
  }
});
