import { askMedication } from '../utils/providers/gemini'
import path from 'path';
import { readFile, writeFile } from 'fs/promises'
import TurndownService from 'turndown'

// Get context from server/data/medications.md file
const filePath = path.resolve(process.cwd(), 'server/data/medication.md');
let context = await readFile(filePath, 'utf-8');
console.log('Loaded Context length:', context.length);

// async function prepareData() {
//   const medication = await import('../data/medication.json');
//   const tds = new TurndownService({headingStyle: 'atx'})
//   console.log(JSON.stringify(medication).length, ' characters');
//   const filteredText = medication.data.allM_Content_Medication.results.map((item) => `\`\`\`
// title: ${item.medication_Title}
// url_slug: ${item.medication_FriendlyUrl}
// keywords: ${item.medication_ENKeywords}
// \`\`\`

// ${tds.turndown(item.medication_ContentBody).split(/\*?\*?Disclai/i)[0].trim()}`).join('\n');

//   const filePath = path.resolve(process.cwd(), 'server/data/medication.md');
//   writeFile(filePath, filteredText);
//   console.log('File written to:', filePath);
//   console.log(filteredText.length, ' characters');
// }

// prepareData();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'A valid query string is required'
      })
    }

    // Set a reasonable timeout for the request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 30000) // 30 seconds timeout
    })

    // Race between the actual request and the timeout
    const response = await Promise.race([
      askMedication(query, context),
      timeoutPromise
    ]) as string
    
    return {
      success: true,
      data: response,
      query: query,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Error in medication API:', error)
    
    const statusCode = error.statusCode || 500
    const message = error.message || 'An error occurred while processing your request'
    
    setResponseStatus(event, statusCode)
    
    return {
      success: false,
      error: message,
      statusCode
    }
  }
})
