import { PromptEnhancer } from '~/server/utils/providers/copilot';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  
  try {
    if (!body.question || !body.data) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: question and data',
      });
    }

    const promptEnhancer = new PromptEnhancer(config.groqApiKey);
    const answer = await promptEnhancer.analyzeData(body.question, body.data);

    return {
      answer,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process question',
    });
  }
});
