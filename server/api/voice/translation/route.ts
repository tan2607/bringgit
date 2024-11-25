import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  provider?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TranslationRequest;
    const { text, sourceLanguage, targetLanguage, provider = 'openai' } = body;

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Text and target language are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let translatedText: string;

    switch (provider.toLowerCase()) {
      case 'openai':
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || "",
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following text to ${targetLanguage}${
                sourceLanguage ? ` from ${sourceLanguage}` : ''
              }. Maintain the original meaning, tone, and style while ensuring the translation is natural and culturally appropriate.`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3,
        });

        translatedText = response.choices[0].message.content || '';
        break;

      default:
        throw new Error(`Unsupported translation provider: ${provider}`);
    }

    return new Response(JSON.stringify({ translatedText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
