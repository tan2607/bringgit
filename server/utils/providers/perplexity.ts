import { BaseProvider } from './base'
import { generateText } from "ai";
import { createPerplexity } from "@ai-sdk/perplexity";

export class PerplexityProvider extends BaseProvider {
    protected static instance: any;
    protected constructor(apiKey: string) {
        return createPerplexity({
            apiKey: apiKey,
        });
    }

    public static async sonar(
        prompt: string,
    ): Promise<string> {
        const { text } = await generateText({
            model: perplexity("sonar-pro"),
            prompt: prompt,
        });
        return text;
    }
}
