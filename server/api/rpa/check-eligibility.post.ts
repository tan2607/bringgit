import { chromium } from 'playwright-core'
import { Browserbase } from '@browserbasehq/sdk'
import { PromptEnhancer } from '~/server/utils/providers/copilot'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { zipCode, dateOfBirth } = body

    if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID || !process.env.GROQ_API_KEY) {
      throw new Error('Required configuration missing')
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

    // Get the debug connection URL for frontend display
    const { debuggerFullscreenUrl } = await bb.sessions.debug(session.id)

    // Navigate to UHC Medicare eligibility page
    await page.goto('https://www.uhc.com/communityplan')

    // Fill in the form
    await page.fill('#zipSearch-1907232265', zipCode)
    await page.click('button.c-zip-search__submit')

    // Wait for results and extract information
    await page.waitForSelector('.c-plan-results-container')
    let eligibilityInfo = await page.innerText('.c-plan-results-container')

    // Maximum length of eligibility info is 5000 characters
    if (eligibilityInfo.length > 5000) {
      eligibilityInfo = eligibilityInfo.substring(0, 5000)
    }

    // console.log('Eligibility info:', eligibilityInfo)

    // Close browser
    await browser.close()
    
    // Format the eligibility info into markdown
    const markdownContent = await promptEnhancer.formatToMarkdown(eligibilityInfo || '')    

    console.log('Markdown content:', markdownContent)

    return {
      success: true,
      markdownContent,
      debugUrl: debuggerFullscreenUrl
    }
  } catch (error: any) {
    console.error('RPA Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
