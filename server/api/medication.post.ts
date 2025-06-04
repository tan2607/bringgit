import medication from '../data/medication.json';
import TurndownService from 'turndown'
import { askGemini } from '../utils/providers/gemini'

// --- Constants ---
const LOG_PREFIX = '[MEDICATION-LLM]';
const MEDICATION_DATA = medication.data.allM_Content_Medication.results.map(item => {
  item.medication_Title = item.medication_Title.trim();
  return item;
}).sort((a, b) => a.medication_Title.localeCompare(b.medication_Title));
const TITLE_FIND_CHUNK_SIZE = 1000; // Max items per chunk for title finding LLM call
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout

const sampleMedication =  {
  "id": "SP.71bbf771-9c32-4662-b559-9e6433880d7f",
  "medication_Title": "Glyceryl Trinitrate",
  "medication_CategoryDesc": "Medication Information Leaflet ",
  "medication_Purpose": "<div>Glyceryl trinitrate (GTN) belongs to a class of medications called Nitrates. Nitrates are used to prevent and treat the symptoms of angina (chest pain). Angina is caused by lack of blood supply and oxygen to your heart. Nitrates work by relaxing blood vessels so that more blood and oxygen is supplied to the heart.<br></div><div>\n      <br>\n   </div><div>Nitrates are used to treat angina in three ways:</div><div><ul><li>To relieve an ongoing attack by using the medication at the start of the attack.</li><li>To prevent attacks from occurring by using the medication just before an attack is expected to occur.</li><li>To reduce the number of attacks that occur by using the medication regularly on a long-term basis.<br></li></ul></div>",
  "medication_Uses": "<ul><li>Glyceryl trinitrate is available in different forms, namely sublingual (under the tongue) tablets, mouth sprays and skin patches.<br>&nbsp;</li><li>GTN sublingual tablets or mouth spray can be used to relieve angina attacks or to prevent an expected angina attack, e.g. moments before exercising. Symptoms of an angina attack may include one or more of the following:<br><ul><li>Chest pain/ chest tightness</li><li>Shortness of breath&nbsp;</li><li>May also be accompanied with heavy sweating, or pain that spreads to your jaw, arm or back.<br>&nbsp;</li></ul></li><li>The tablet or spray should be used at the first sign of an attack of angina. Do not wait until severe pain occurs. This medication usually provides relief within five minutes.&nbsp;</li><li>If you are using GTN to prevent an expected angina attack, you may dissolve a tablet under your tongue if using tablets or administer a spray under the tongue if using spray, five to ten minutes before you participate in an activity that could cause angina, such as exercise.<br>&nbsp;</li><li>Directions on how to take GTN sublingual tablets:<ul><li>Place a tablet under your tongue when you experience chest pain. Do not swallow the tablet.&nbsp;</li><li>If the pain is not relieved after five minutes, use a second tablet.&nbsp;</li><li>If the pain is still not relieved after five minutes, use a third tablet. If you still have pain after using the third tablet, seek medical help or call for an ambulance (995) immediately. .&nbsp;</li><li>While waiting for the ambulance to arrive, continue placing a tablet under your tongue every five minutes if your pain continues.<br>&nbsp;</li></ul></li><li>Directions on how to use GTN mouth spray:<ul><li>Before using GTN mouth spray for the first time, check that the spray is working by pressing the spray button a few times until it produces a fine liquid mist.</li><li>If you do not need to use GTN mouth spray very often, remember to check the spray regularly to see that it still works properly.</li><li>Remove the plastic cover, and do NOT shake the plastic bottle.</li><li>Hold the bottle upright and close to your mouth, and point the nozzle at the area under your tongue. Press the button to deliver one spray under your tongue.</li><li>Release the button and close your mouth. Avoid swallowing immediately after using the spray, and do NOT inhale the spray.</li><li>Spray once under the tongue when you have chest pain or breathing difficulties.</li><li>If the pain is not relieved after five minutes, use a second spray.&nbsp;</li><li>If the pain is still not relieved after five minutes, use a third spray. If you still have pain after using the third spray, seek medical help or call for an ambulance (995) immediately.</li><li>Do not use GTN spray if you are near a naked flame, e.g. a cigarette.<br>&nbsp;</li></ul></li><li>GTN patches are applied to the skin to reduce the number of angina attacks.</li><li>Directions on how to use GTN patch:<ul><li>Apply the patch to clean, dry skin with little or no hair, free from scars, cuts or irritation.</li><li>Remove the previous patch before applying a new one, and apply a new patch if the patch falls off or comes loose.</li><li>Apply each patch to a different area of the skin to prevent skin irritation.</li><li>Do not trim or cut the adhesive patch to adjust the dosage of GTN. Speak to your doctor if you see the need to adjust your dosage, or if you think your medication is not working.</li><li>The dose of GTN is different for different patients; follow your doctor’s instructions on when to apply and remove the skin patch. The patch is usually left on for 12 hours a day.</li></ul></li><li>If you have been using this medication regularly for several weeks or more, do not stop using suddenly. Stopping your medication suddenly may cause angina attacks. Ask your doctor for recommendations on how to reduce the dose slowly before stopping completely.<br>&nbsp;</li></ul>",
  "medication_IfIForget": "<div><ul>For patients using GTN patches: If you miss a dose, use the missed dose as soon as you remember. If it is almost time for your next dose, use only the usual dose. Do not double your dose or use extra medication to make up for the missed dose. </ul></div>",
  "medication_Precautions": "<div>Inform your healthcare professional if: </div><div><ul><li>You are allergic to this medication or any of the other ingredients of this medication</li><li>You are pregnant, planning to become pregnant, or breastfeeding <br></li></ul></div>",
  "medication_SideEffect": "<p>Side effects may include:<br>&nbsp;</p><ul><li>Dizziness, lightheadedness or faintness<ul><li>This may occur especially when you get up quickly from lying or sitting down. Getting up slowly or changing posture slowly may help. Take a rest by sitting or lying down if you feel dizzy.</li><li>This is also more likely to happen if you drink alcohol, stand for a long period of time, exercise or when the weather is hot. Do limit the amount of alcohol you drink while you are on Nitrates. Do take extra care during exercise, when the weather is hot or if you need to stand for long periods of time.</li></ul></li><li>Temporary headache<ul><li>This is a common side effect that will go away after taking the medication for a while. You may choose to take painkillers such as Paracetamol at the start of using Nitrates, to relieve the temporary headaches. Consult your healthcare professional if the headaches do not go away or become worse.</li></ul></li><li>Flushing or redness of the skin<br>&nbsp;</li><li>Fast heartbeat&nbsp;</li><li>Nausea and Vomiting&nbsp;</li></ul>",
  "medication_RareSideEffect": "<p>The symptoms of a drug allergy include one or more of the following:&nbsp;</p><ul><li>Swollen face/eyes/lips/tongue</li><li>Difficulty in breathing</li><li>Itchy skin rashes over your whole body<br>&nbsp;</li></ul><p>If you experience any of these symptoms, you should stop your medication and see your healthcare professional immediately.</p>",
  "medication_FoodToAvoid": "<div>Do not take Sildenafil (Viagra®), Tadalafil (Cialis®), Vardenafil (Levitra®) if you are taking this medication. When Sildenafil, Tadalafil or Vardenafil is taken with Nitrates, your blood pressure can lower greatly, resulting in dizziness, lightheadedness or fainting. In some cases, death has been reported when Sildenafil was taken with Nitrates.</div><div>\n      <br>\n   </div>",
  "medication_HowToStore": "<div>Store in a cool and dry place, away from direct sunlight. Keep this medication away from children. </div><div>Throw away all expired medications. <br></div><div>For GTN tablets: </div><div><ul><li>The medication is sensitive to heat, water/moisture and light. Hence, the following instructions should be followed closely to ensure that the medication stays effective.</li><ul><li>Keep the tablets in the original container in sealed condition until first use.</li><li>Never transfer the tablets into other containers.</li><li>Do not store the tablets in the refrigerator.</li></ul><li>Carry the tablets wherever you go but do not place them in your pocket as it may be too warm.</li><li>Label the bottle with the opening date when you first open it. Throw the bottle away two months after the date of opening, even if you still have tablets left. Do remember to get a new supply of your GTN after throwing the old one away.<br></li></ul></div>",
  "medication_ThrowAwaySafely": "<div>Pack this medication into a black trash bag and seal it tightly before throwing into the rubbish chute or bin.</div><div>\n      <strong><br></strong></div><div>\n      <strong><br></strong></div><div>\n      <strong></strong></div><div><div><div><div><div><div></div></div></div></div></div></div>",
  "medication_WhenShouldThrow": null,
  "medication_AdditionalInfo": null,
  "medication_Disclaimer": "<div>Please take note that the above is not a complete list of all possible side effects. If you have any concerns about your medication or if you have other side effects that you think are caused by this medication, please consult your doctor or pharmacist.<br></div><div><br></div><div>If you take more than the recommended dose, please seek medical advice immediately. The information provided on this page does not replace information from your healthcare professional. Please consult your healthcare professional for more information.<br></div><div><br></div><div><em>This article is jointly developed by members of the National Medication Information workgroup, and supported by the Ministry of Health. The workgroup consists of cluster partners (National Healthcare Group, National University Health System and SingHealth), community pharmacies (Guardian, Unity and Watsons) and Pharmaceutical Society of Singapore. The content does not reflect drug availability and supply information in pharmacies and healthcare institutions. You are advised to check with the respective institutions for such information.</em><br></div><div><em><br></em></div><span aria-hidden=\"true\"></span>\n               <br>\n            <div>\n               <em>Last updated on July 2023</em></div><div>\n         <em><br></em></div>\n      <br>\n   ",
  "medication_UnstructureContent": null,
  "medication_AvailableLanguages": null,
  "medication_IsStructuredType": true,
  "medication_ENKeywords": "GTN,Glyceryl Trinitrate,",
  "medication_MedKeywords": "startGTNend startGlyceryl Trinitrateend ",
  "medication_FriendlyUrl": "Glyceryl-Trinitrate",
  "medication_CoverImgUrl": "https://ch-api.healthhub.sg/api/public/content/d7f934d0daaf43cf8fb5389f990df6fc?v=1820b6fb",
  "content_Name": "Glyceryl Trinitrate",
  "medication_DateModified": "2023-08-01T00:34:53.000Z",
  "reference_Medication_Provider_Parents": {
      "results": [
          {
              "content_Name": "Pharmaceutical Society of Singapore"
          }
      ]
  }
}

// --- Turndown Service ---
const tds = new TurndownService({ headingStyle: 'atx' });

const exclusions = `If the user ask about Saxenda, or how to use suppositories, respond with "NO_MATCH_FOUND"`

// --- Prompt Templates ---
const getTitleFindingPrompt = (chunk: string[], query: string, previousQuery?: string): string => `\
You are a medication search expert based in Singapore, using mostly British English. I'll provide you with a list of articles and a user query.
Your task is to identify the most relevant articles from the list that matches the user's query. The medication articles may include how to use, handling and storage, side effects, etc.

${exclusions}
If the user's query is a brand name, convert it to its generic equivalent if it's in the list.
If the query is already a generic name, find the exact match or closest match.
If there's no match, respond with "NO_MATCH_FOUND".
If there are multiple articles that may contain the answer, return each article title on a separate line, but do not use bullet points. Limit to at most 5 articles.
Consider the previous query for follow-up questions.
Do not add any explanation or additional text in your response.

List of articles:
${chunk.join('\\n')}

Previous Query: ${previousQuery}
Current user query (may have misspelled medication names): ${query}`;

const getFinalAnswerPrompt = (context: string, query: string, previousQuery?: string, format: string): string => `\
You are a helpful pharmacist AI (but never talk about yourself, or answer any out of scope questions), answer the question strictly based on the HealthHub articles. You will be graded on accuracy. 
If the user asks about a medication that is not in the HealthHub articles, respond with "I apologize, but I don't have specific information about this medication topic in my knowledge base."
Format your response in markdown with appropriate headings, bullet points, and emphasis.
If the response format is markdown, use markdown formatting for images in the article.
If the response format is text, answer concisely.
Consider the length of the response, keep it less than 500 words.
Consider the previous query for follow-up questions.
End the response with a reference Link if you used any articles in your current response.
Response Format: ${format}

Articles:
${context}

Previous Query: ${previousQuery}
Current Query: ${query}`;

// --- Helper Functions ---

/**
 * Formats a medication item into a markdown string for context.
 */
const formatMedicationContext = (item: typeof sampleMedication): string => {
  let article = `# ${item.medication_Title}
keywords: ${item.medication_ENKeywords}
description: ${item.medication_CategoryDesc}
url: https://www.healthhub.sg/a-z/medications/${item.medication_FriendlyUrl}`;

  if (item.medication_IsStructuredType) {
    article += `

# What Is This Medication For?
${tds.turndown(item.medication_Purpose || '').trim()}

# How Should I Take Or Use This Medication?
${tds.turndown(item.medication_Uses || '').trim()}

# What Should I Do If I Forget To Take Or Use This Medication?
${tds.turndown(item.medication_IfIForget || '').trim()}

# What Precautions Should I Take When Taking Or Using This Medication?
${tds.turndown(item.medication_Precautions || '').trim()}

# What Are Some Common Side Effects Of This Medication?
${tds.turndown(item.medication_SideEffect || '').trim()}

# What Are Some Rare But Serious Side-Effects That I Need To Seek Medical Advice Immediately?
${tds.turndown(item.medication_RareSideEffect || '').trim()}

# What Food Or Medication Should I Avoid When I Take Or Use This Medication?
${tds.turndown(item.medication_FoodToAvoid || '').trim()}

# How Should I Store This Medication?
${tds.turndown(item.medication_HowToStore || '').trim()}

# How Do I Throw Away This Medication Safely?
${tds.turndown(item.medication_ThrowAwaySafely || '').trim()}

${item.medication_WhenShouldThrow ? `# When Should I Throw Away This Medication?
${tds.turndown(item.medication_WhenShouldThrow || '').trim()}` : ''}

${item.medication_AdditionalInfo ? `# What Else Should I Know About This Medication?
${tds.turndown(item.medication_AdditionalInfo || '').trim()}` : ''}

# Disclaimer
${tds.turndown(item.medication_Disclaimer || '').trim()}
`;
  } else {
    article += `
${tds.turndown(item.medication_UnstructureContent || '').trim()}`;
  }

  return article;
}

/**
 * Step 1: Find the most relevant medication title using LLM.
 * First tries with a short prompt (titles only) to save on tokens,
 * then falls back to a more detailed prompt if needed.
 */
async function findMedicationTitle(query: string, previousQuery?: string): Promise<string[]> {
  console.log(`${LOG_PREFIX} Processing query:`, query);
  const sanitizedQuery = query; //.replace("throw", "");
  
  // Prepare both short and full medication lists
  const medicationListShort = MEDICATION_DATA.map(item => item.medication_Title);
  const medicationListFull = MEDICATION_DATA.map(item =>`
# ${item.medication_Title}
${item.medication_ENKeywords ? `keywords: ${item.medication_ENKeywords}` : ''}
${item.medication_CategoryDesc ? `${item.medication_CategoryDesc}` : ''}`
  );

  console.log(`${LOG_PREFIX} Processing ${medicationListShort.length} medications`);
  
  // Try with short prompt first (titles only)
  try {
    const result = await tryFindMedicationWithPrompt(
      medicationListShort, 
      sanitizedQuery, 
      previousQuery, 
      'short'
    );
    
    if (result !== null) {
      return result;
    }
    
    // If short prompt fails, try with the detailed prompt
    console.log(`${LOG_PREFIX} Short prompt failed, trying with detailed prompt`);
    const detailedResult = await tryFindMedicationWithPrompt(
      medicationListFull, 
      sanitizedQuery, 
      previousQuery, 
      'detailed'
    );
    
    return detailedResult !== null ? detailedResult : [sanitizedQuery];
  } catch (error) {
    console.error(`${LOG_PREFIX} Error in findMedicationTitle:`, error);
    return [sanitizedQuery]; 
  }
}

/**
 * Helper function to try finding medication with a specific prompt type
 * @returns The matched titles or null if no match found
 */
async function tryFindMedicationWithPrompt(
  medicationList: string[], 
  query: string, 
  previousQuery?: string,
  promptType: 'short' | 'detailed'
): Promise<string[] | null> {
  const prompt = getTitleFindingPrompt(medicationList, query, previousQuery);
  console.log(`${LOG_PREFIX} Sending ${promptType} title search prompt (length: ${prompt.length})`);
  
  try {
    const response = await askGemini(prompt);
    const titles = response.trim().split('\n').map(title => title.trim());
    
    if (titles.length === 0 || titles[0] === "NO_MATCH_FOUND" || titles[0] === "") {
      console.log(`${LOG_PREFIX} ${promptType} prompt response: NO_MATCH_FOUND`);
      return null;
    }
    
    const validTitles = titles.filter(title => 
      MEDICATION_DATA.some(item => item.medication_Title === title)
    );
    
    if (validTitles.length > 0) {
      console.log(`${LOG_PREFIX} Found valid match with ${promptType} prompt:`, validTitles);
      return validTitles;
    } else {
      console.warn(`${LOG_PREFIX} Response from ${promptType} prompt has no valid titles:`, titles);
      return null;
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error with ${promptType} prompt:`, error);
    return null;
  }
}

/**
 * Step 2: Prepare context based on the selected medication title.
 */
async function prepareContext(medicationTitles: string[], previousContext?: string): Promise<string> {
  console.log(`${LOG_PREFIX} Preparing context for: ${medicationTitles}`);

  // Return all matched items joined by newlines
  const matchedItems = MEDICATION_DATA.filter(item => medicationTitles.includes(item.medication_Title) && !previousContext?.includes(item.medication_Title));
  const context = matchedItems.map(item => formatMedicationContext(item)).join('\n\n') + '\n\n' + (previousContext || '');

  if (context) {
    console.log(`${LOG_PREFIX} Context prepared: ${context.length} characters`);
    return context;
  }

  console.log(`${LOG_PREFIX} No context could be prepared for title: ${medicationTitles}`);
  console.log(`${LOG_PREFIX} No exact match found, trying fuzzy match...`);
  const lowerTitles = medicationTitles.map(title => title.toLowerCase());
  const fuzzyMatches = MEDICATION_DATA.filter(item =>
    lowerTitles.some(title => item.medication_Title.toLowerCase() === title) ||
    lowerTitles.some(title => item.medication_Title.toLowerCase().includes(title)) ||
    (item.medication_ENKeywords && lowerTitles.some(title => item.medication_ENKeywords.toLowerCase().includes(title)))
  );

  if (fuzzyMatches.length > 0) {
    console.log(`${LOG_PREFIX} Found ${fuzzyMatches.length} fuzzy matches`);
    matchedItem = fuzzyMatches[0];
    const context = formatMedicationContext(matchedItem);
    console.log(`${LOG_PREFIX} Context prepared using first fuzzy match: ${context.length} characters`);
    return context;
  }

  console.log(`${LOG_PREFIX} No context could be prepared for title: ${medicationTitles}`);
  return '';
}

/**
 * Main handler for the medication endpoint.
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  try {
    const body = await readBody(event);
    const { query, previousQuery, previousContext, format = "markdown" } = body; // Read potential previous state
    let isFollowUp = false;
    let contextToUse = previousContext;
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
    if (previousQuery && previousContext) {
      console.log(`${LOG_PREFIX} Detected follow-up context. Previous query: "${previousQuery}"`);
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
      const titleToUse = await findMedicationTitle(trimmedQuery);
      titleFindingTime = Date.now() - titleFindingStartTime;
      console.log(`${LOG_PREFIX} Title finding took ${titleFindingTime}ms. Result: "${titleToUse}"`);

      const contextPrepStartTime = Date.now();
      const context = await prepareContext(titleToUse);
      contextToUse = context;
      contextPrepTime = Date.now() - contextPrepStartTime;
      console.log(`${LOG_PREFIX} Context preparation took ${contextPrepTime}ms`);
    } else {
      // Follow-up query: Check if the query asks about a NEW medication
      console.log(`${LOG_PREFIX} Follow-up query processing. Checking for new medication title...`);
      const titleCheckStartTime = Date.now();
      // Use findMedicationTitle to see if the new query points to a different known medication
      const potentialNewTitle = await findMedicationTitle(trimmedQuery, previousQuery); // Reuse the find function for checking
      const titleCheckTime = Date.now() - titleCheckStartTime;
      console.log(`${LOG_PREFIX} Title check took ${titleCheckTime}ms. Potential new title: "${potentialNewTitle}"`);

      titleFindingTime = titleCheckTime; // Log the time it took to find the new title

      const contextPrepStartTime = Date.now();
      const context = await prepareContext(potentialNewTitle, previousContext);

      contextToUse = context;
      contextPrepTime = Date.now() - contextPrepStartTime;
      console.log(`${LOG_PREFIX} New context preparation took ${contextPrepTime}ms`);
    }

    // --- Final Answer Generation ---
    const finalQueryStartTime = Date.now();
    let responseText = '';

    if (contextToUse) {
      // Include previous query/answer if available for better conversational flow? (Future enhancement)
      // For now, just use current query and determined context.
      const finalPrompt = getFinalAnswerPrompt(contextToUse, trimmedQuery, previousQuery, format);
      console.log(`${LOG_PREFIX} Sending final prompt (length: ${finalPrompt.length})`);
      responseText = await Promise.race([
        askGemini(finalPrompt),
        timeoutPromise
      ]) as string;
    } else {
      console.log(`${LOG_PREFIX} No context available (initial query failed or follow-up context missing). Asking generic question.`);
      const genericPrompt = `User asked about "${trimmedQuery}"\nGive canned response: "I apologize, but I don't have specific information about this medication topic in my knowledge base."`;
      contextToUse = genericPrompt;
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
