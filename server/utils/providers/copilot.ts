import OpenAI from "openai";

export class PromptEnhancer {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  async updatePrompt(originalPrompt: string, instructions: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing and refining AI assistant prompts. Your task is to modify the original prompt according to the user's instructions. Keep the core functionality intact while incorporating the requested changes. Return only the modified prompt without any explanations or additional text."
        },
        {
          role: "user",
          content: `Original Prompt:\n${originalPrompt}\n\nInstructions for changes:\n${instructions}\n\nPlease provide the updated prompt.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || originalPrompt;
  }
}
