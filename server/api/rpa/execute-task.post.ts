import { chromium } from 'playwright-core'
import { Browserbase } from '@browserbasehq/sdk'
import { PromptEnhancer } from '~/server/utils/providers/copilot'
import { auto } from 'auto-playwright'
import { test } from '@playwright/test'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { description, parameters } = body

    if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID || !process.env.GROQ_API_KEY || !process.env.OPENAI_API_KEY) {
      throw new Error('Required configuration missing')
    }

    // Validate required URL parameter
    if (!parameters.url) {
      throw new Error('URL parameter is required')
    }

    const bb = new Browserbase(process.env.BROWSERBASE_API_KEY)
    const promptEnhancer = new PromptEnhancer(process.env.GROQ_API_KEY)

    console.log('Starting RPA process...')
    // Create a new session
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID
    })

    // Connect to the session
    const browser = await chromium.connectOverCDP(session.connectUrl)
    const context = browser.contexts()[0]
    const page = await context.newPage()

    // Navigate to the specified URL
    await page.goto(parameters.url)
    
    console.log('Executing task steps:', description)
    console.log('Parameters:', parameters)

    // Execute each task step sequentially
    const results = []
    for (const step of description) {
      const stepResult = await auto(step, { page, test })
      results.push(stepResult)
    }
    
    // Verify the task completion
    const verificationResult = await auto('Verify if all steps were completed successfully and describe what was done', { page, test })
    
    // Close browser
    await browser.close()
    
    // Format the results into markdown
    const markdownContent = await promptEnhancer.formatToMarkdown(`
Task Execution Results:
----------------------
${results.map((result, index) => `Step ${index + 1}:\n${result}`).join('\n\n')}

Verification:
------------
${verificationResult}
`)    

    return {
      success: true,
      markdownContent,
      debugUrl: ""
    }
  } catch (error: any) {
    console.error('RPA Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
