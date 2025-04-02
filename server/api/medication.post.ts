import medication from '../data/medication.json';
import TurndownService from 'turndown'
import { askGemini } from '../utils/providers/gemini'

// --- Constants ---
const LOG_PREFIX = '[MEDICATION-LLM]';
const MEDICATION_DATA = medication.data.allM_Content_Medication.results;
const TITLE_FIND_CHUNK_SIZE = 1000; // Max items per chunk for title finding LLM call
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout

// --- Turndown Service ---
const tds = new TurndownService({ headingStyle: 'atx' });

// --- Prompt Templates ---
const getTitleFindingPrompt = (chunk: string[], query: string): string => `\
You are a medication search expert. I'll provide you with a list of medications and a user query.
Your task is to identify the most relevant medication from the list that matches the user's query.

If the user's query is a brand name, convert it to its generic equivalent if it's in the list.
If the query is already a generic name, find the exact match or closest match.
If there are multiple matches, choose the most relevant one.
If there's no good match, respond with "NO_MATCH_FOUND".

List of medications:
${chunk.join('\\n')}

User query: ${query}

Return ONLY the exact medication title from the list that best matches the query. It is case sensitive. Do not add any explanation or additional text.`;

const getFinalSelectionPrompt = (potentialMatches: string[], query: string): string => `\
You are a medication search expert. I'll provide you with a list of potential medication matches and a user query.
Your task is to select the single best match from these options.

Potential matches:
${potentialMatches.join('\\n')}

User query: ${query}

Return ONLY the exact medication title from the list that best matches the query. Do not add any explanation or additional text.`;

const getFinalAnswerPrompt = (context: string, query: string, urlSlug: string | undefined): string => `\
Answer the user question strictly based on the information provided. You will be graded on comprehensiveness and accuracy. If the information is not available in the provided content, say so clearly. Format your response in markdown with appropriate headings, bullet points, and emphasis.${urlSlug ? ` Always use full url in citation at the end of response. HealthHub Reference: https://www.healthhub.sg/a-z/medications/${urlSlug}` : ''}

${context}

${query}`;

// --- Helper Functions ---

/**
 * Formats a medication item into a markdown string for context.
 */
const formatMedicationContext = (item: typeof MEDICATION_DATA[0]): string => `\
\\\`\\\`\\\`
title: ${item.medication_Title}
url_slug: ${item.medication_FriendlyUrl}
keywords: ${item.medication_ENKeywords}
\\\`\\\`\\\`

${tds.turndown(item.medication_ContentBody).split(/\\*?\\*?Disclai/i)[0].trim()}`;


/**
 * Step 1: Find the most relevant medication title using LLM.
 */
async function findMedicationTitle(query: string): Promise<string> {
  console.log(`${LOG_PREFIX} Processing query:`, query);

  const medicationList = MEDICATION_DATA.map(item =>
    `${item.medication_Title}${item.medication_ENKeywords ? ` (Keywords: ${item.medication_ENKeywords})` : ''}`
  );

  console.log(`${LOG_PREFIX} Processing ${medicationList.length} medications in a single request`);

  const prompt = getTitleFindingPrompt(medicationList, query);

  try {
    const response = await askGemini(prompt);
    const trimmedResponse = response.trim();

    if (trimmedResponse !== "NO_MATCH_FOUND" && trimmedResponse !== "") {
      const isValidTitle = MEDICATION_DATA.some(item => item.medication_Title === trimmedResponse);
      if (isValidTitle) {
        console.log(`${LOG_PREFIX} Found valid match:`, trimmedResponse);
        return trimmedResponse;
      } else {
        console.warn(`${LOG_PREFIX} Response "${trimmedResponse}" is not a valid title. Falling back to query.`);
        return query; 
      }
    } else {
      console.log(`${LOG_PREFIX} Response: NO_MATCH_FOUND. Falling back to query.`);
      return query; 
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error finding medication title:`, error);
    return query; 
  }
}

/**
 * Step 2: Prepare context based on the selected medication title.
 */
async function prepareContext(medicationTitle: string): Promise<{ context: string; urlSlug?: string }> {
  console.log(`${LOG_PREFIX} Preparing context for: ${medicationTitle}`);

  let matchedItem = MEDICATION_DATA.find(item => item.medication_Title === medicationTitle);

  if (matchedItem) {
    console.log(`${LOG_PREFIX} Found exact match for context`);
    const context = formatMedicationContext(matchedItem);
    console.log(`${LOG_PREFIX} Context prepared: ${context.length} characters`);
    return { context, urlSlug: matchedItem.medication_FriendlyUrl };
  }

  console.log(`${LOG_PREFIX} No exact match found, trying fuzzy match...`);
  const lowerTitle = medicationTitle.toLowerCase();
  const fuzzyMatches = MEDICATION_DATA.filter(item =>
    item.medication_Title.toLowerCase() === lowerTitle ||
    item.medication_Title.toLowerCase().includes(lowerTitle) ||
    (item.medication_ENKeywords && item.medication_ENKeywords.toLowerCase().includes(lowerTitle))
  );

  if (fuzzyMatches.length > 0) {
    console.log(`${LOG_PREFIX} Found ${fuzzyMatches.length} fuzzy matches`);
    matchedItem = fuzzyMatches[0];
    const context = formatMedicationContext(matchedItem);
    console.log(`${LOG_PREFIX} Context prepared using first fuzzy match: ${context.length} characters`);
    return { context, urlSlug: matchedItem.medication_FriendlyUrl };
  }

  console.log(`${LOG_PREFIX} No context could be prepared for title: ${medicationTitle}`);
  return { context: '' }; 
}

/**
 * Main handler for the medication endpoint.
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  try {
    const body = await readBody(event);
    const { query, previousContext, previousTitle } = body; // Read potential previous state
    let isFollowUp = false;
    let contextToUse = previousContext;
    let titleToUse = previousTitle;
    let titleFindingTime = 0;
    let contextPrepTime = 0;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'A valid query string is required'
      });
    }
    const trimmedQuery = query.trim();

    console.log(`${LOG_PREFIX} Received query: ${trimmedQuery}`);
    if (previousContext && previousTitle) {
      console.log(`${LOG_PREFIX} Detected follow-up context. Previous title: "${previousTitle}"`);
      isFollowUp = true;
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), REQUEST_TIMEOUT_MS);
    });

    // --- Determine Medication Title and Context ---
    if (!isFollowUp) {
      // Initial query: Find title and prepare context
      console.log(`${LOG_PREFIX} Initial query processing.`);
      const titleFindingStartTime = Date.now();
      titleToUse = await findMedicationTitle(trimmedQuery);
      titleFindingTime = Date.now() - titleFindingStartTime;
      console.log(`${LOG_PREFIX} Title finding took ${titleFindingTime}ms. Result: "${titleToUse}"`);

      const contextPrepStartTime = Date.now();
      const { context, urlSlug: newUrlSlug } = await prepareContext(titleToUse);
      contextToUse = context;
      contextPrepTime = Date.now() - contextPrepStartTime;
      console.log(`${LOG_PREFIX} Context preparation took ${contextPrepTime}ms`);
    } else {
      // Follow-up query: Check if the query asks about a NEW medication
      console.log(`${LOG_PREFIX} Follow-up query processing. Checking for new medication title...`);
      const titleCheckStartTime = Date.now();
      // Use findMedicationTitle to see if the new query points to a different known medication
      const potentialNewTitle = await findMedicationTitle(trimmedQuery); // Reuse the find function for checking
      const titleCheckTime = Date.now() - titleCheckStartTime;
      console.log(`${LOG_PREFIX} Title check took ${titleCheckTime}ms. Potential new title: "${potentialNewTitle}"`);

      // If a *different* valid title is found in the follow-up query, fetch new context
      if (potentialNewTitle !== trimmedQuery && potentialNewTitle !== previousTitle) {
        console.log(`${LOG_PREFIX} New medication title "${potentialNewTitle}" detected in follow-up. Fetching new context.`);
        titleToUse = potentialNewTitle; // Use the new title
        titleFindingTime = titleCheckTime; // Log the time it took to find the new title

        const contextPrepStartTime = Date.now();
        const { context, urlSlug: newUrlSlug } = await prepareContext(titleToUse);
        contextToUse = context; // Use the new context
        contextPrepTime = Date.now() - contextPrepStartTime;
        console.log(`${LOG_PREFIX} New context preparation took ${contextPrepTime}ms`);
      } else {
        // Otherwise, reuse the previous context and title
        console.log(`${LOG_PREFIX} No new medication title detected. Reusing previous context for title "${titleToUse}".`);
        // titleFindingTime and contextPrepTime remain 0 as we reused
      }
    }

    // --- Final Answer Generation ---
    const finalQueryStartTime = Date.now();
    let responseText = '';
    const { urlSlug } = await prepareContext(titleToUse); // Get urlSlug for citation, even if context is reused

    if (contextToUse) {
      // Include previous query/answer if available for better conversational flow? (Future enhancement)
      // For now, just use current query and determined context.
      const finalPrompt = getFinalAnswerPrompt(contextToUse, trimmedQuery, urlSlug);
      console.log(`${LOG_PREFIX} Sending final prompt (length: ${finalPrompt.length}) for title "${titleToUse}"`);
      responseText = await Promise.race([
        askGemini(finalPrompt),
        timeoutPromise
      ]) as string;
    } else {
      console.log(`${LOG_PREFIX} No context available (initial query failed or follow-up context missing). Asking generic question.`);
      const genericPrompt = `User asked about "${trimmedQuery}" but I couldn't find specific information. Please provide general information or state that details are unavailable.`;
      responseText = await Promise.race([
        askGemini(genericPrompt),
        timeoutPromise
      ]) as string;
    }

    const finalQueryTime = Date.now() - finalQueryStartTime;
    console.log(`${LOG_PREFIX} Final query took ${finalQueryTime}ms`);

    const totalTime = Date.now() - startTime;

    // --- Response ---
    return {
      success: true,
      data: responseText,
      query: trimmedQuery,
      context: contextToUse, // Return the context used for the response
      matchedTitle: (titleToUse !== trimmedQuery) ? titleToUse : null, // Return the title if found, null otherwise
      metrics: {
        totalTimeMs: totalTime,
        titleFindingTimeMs: titleFindingTime,
        contextPrepTimeMs: contextPrepTime,
        finalQueryTimeMs: finalQueryTime,
        contextLength: contextToUse?.length ?? 0 // Use optional chaining and nullish coalescing
      },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX} Error in medication API:`, error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'An error occurred while processing your request';

    setResponseStatus(event, statusCode);

    return {
      success: false,
      error: message,
      statusCode
    };
  }
});
