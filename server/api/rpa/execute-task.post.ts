import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

let sessionId: string;

async function runJob(page, parameters) {
  console.log("Running job...");
  console.log('Executing task steps:', description)
  console.log('Parameters:', parameters)

  // Execute each task step sequentially
  const results = []
  for (const step of description) {
    // Extract variables from the step if it contains any
    const hasVariables = step.includes('%')
    const stepResult = await page.act({
      action: step,
      ...(hasVariables && { variables: parameters })
    })
    results.push(stepResult)
  }

  // Extract final verification if needed
  const verification = await page.extract({
    instruction: "Verify and summarize the task completion",
    schema: z.object({
      success: z.boolean(),
      summary: z.string(),
    }),
  })

  await stagehand.close()

  // Format the results into markdown
  const markdownContent = `
Task Execution Results:
----------------------
${results.map((result, index) => `Step ${index + 1}:\n${JSON.stringify(result, null, 2)}`).join('\n\n')}

Verification:
------------
${verification.summary}
`

  return {
    success: true,
    markdownContent,
    debugUrl: ""
  }
}
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { description, parameters } = body;

    // Validate required URL parameter
    if (!parameters.url) {
      throw new Error("URL parameter is required");
    }

    if (
      !process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID ||
      !process.env.GROQ_API_KEY || !process.env.OPENAI_API_KEY
    ) {
      throw new Error("Required configuration missing");
    }

    console.log("Starting RPA process...");

    // Initialize Stagehand
    let env: "LOCAL" | "BROWSERBASE" = "BROWSERBASE";
    const stagehand = new Stagehand({
      env,
      verbose: 0,
      enableCaching: true,
    });

    let {sessionId, sessionUrl, debugUrl} = await stagehand.init();
    const page = stagehand.page;

    // Navigate to the specified URL
    await page.goto(parameters.url);

    // Observe the page
    const actions = await page.observe();
    console.log("Observed actions:", actions);
    
    // Run the job asynchronously
    // runJob(page, parameters);

    return {
      success: true,
      data: {
        sessionId,
        sessionUrl,
        debugUrl,
        actions,
      },
    };
  } catch (error: any) {
    console.error("RPA Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});
