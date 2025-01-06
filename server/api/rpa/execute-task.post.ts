import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

// Define input validation schema
const taskInputSchema = z.object({
  description: z.array(z.string()),
  parameters: z.object({
    url: z.string().url(),
  }).catchall(z.string()),
});

type TaskInput = z.infer<typeof taskInputSchema>;

export default defineEventHandler(async (event) => {
  try {
    // Get runtime config
    const config = useRuntimeConfig();
    
    // Validate required config
    if (!config.browserbaseApiKey || !config.browserbaseProjectId || 
        !config.groqApiKey || !config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        message: "Required API configuration missing",
      });
    }

    // Parse and validate request body
    const body = await readBody(event);
    const validatedInput = taskInputSchema.safeParse(body);
    
    if (!validatedInput.success) {
      throw createError({
        statusCode: 400,
        message: "Invalid input",
        data: validatedInput.error.format(),
      });
    }

    const { description, parameters } = validatedInput.data;

    // Initialize Stagehand
    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      verbose: 0,
      enableCaching: true,
      apiKey: config.browserbaseApiKey,
      projectId: config.browserbaseProjectId,
    });

    // Initialize session
    const { sessionId, sessionUrl, debugUrl } = await stagehand.init();
    const page = stagehand.page;

    // Navigate to URL
    await page.goto(parameters.url);

    // Observe available actions
    const actions = await page.observe();

    // Execute task steps
    const results = [];
    for (const step of description) {
      const hasVariables = step.includes('%');
      const stepResult = await page.act({
        action: step,
        ...(hasVariables && { variables: parameters }),
      });
      results.push(stepResult);
    }

    // Verify task completion
    const verification = await page.extract({
      instruction: "Verify and summarize the task completion",
      schema: z.object({
        success: z.boolean(),
        summary: z.string(),
      }),
    });

    // Close session
    await stagehand.close();

    // Format results as markdown
    const markdownContent = `
Task Execution Results:
----------------------
${results.map((result, index) => `Step ${index + 1}:\n${JSON.stringify(result, null, 2)}`).join('\n\n')}

Verification:
------------
${verification.summary}
`;

    return {
      success: true,
      data: {
        sessionId,
        sessionUrl,
        debugUrl,
        actions,
        results,
        verification,
        markdownContent,
      },
    };

  } catch (error: any) {
    console.error("RPA Error:", error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to execute RPA task",
      data: error.data,
    });
  }
});
