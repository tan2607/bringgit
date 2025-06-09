import { PromptEnhancer } from '@@/server/utils/providers/copilot'

const config = useRuntimeConfig()
const promptEnhancer = new PromptEnhancer(config.groqApiKey)

export default defineEventHandler(async (event) => {
  try {
    const { purpose, language } = await readBody(event)

    if (!purpose) {
      throw new Error('Purpose is required')
    }

    // Generate template prompt
    const templatePrompt = `Generate a professional SMS template for healthcare communication. 
Purpose: ${purpose}
Requirements:
- Keep it concise and clear (ideal for SMS format)
- Use professional and friendly tone
- Include placeholders in [brackets] for variable information
- Maximum 160 characters (standard SMS length)
- Focus on clear call-to-action if needed
- Ensure HIPAA compliance (no sensitive information)
- For healthcare context, consider patient privacy and medical terminology
- Include appropriate greeting and sign-off if needed`

    // Generate initial template
    let template = await promptEnhancer.updatePrompt('', templatePrompt)

    // Translate if needed
    if (language && language !== 'en') {
      const translationPrompt = `Translate the following SMS template to ${language}, maintaining the same professional tone and keeping all placeholders in [brackets] unchanged. Ensure the translation is natural, culturally appropriate, and maintains the medical context:\n${template}`
      template = await promptEnhancer.updatePrompt(template, translationPrompt)
    }

    return {
      success: true,
      template: template.trim()
    }
  } catch (error: any) {
    console.error('Template generation error:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate template'
    }
  }
})
