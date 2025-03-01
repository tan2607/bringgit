import OpenAI from "openai";

// API to receive a company name and return a research report using Perplexity
async function basicResearchReport(company: string, website?: string) {
  const perplexityProvider = PerplexityProvider.getInstance();
  const query = `Generate Company profile for ${company} ${website || ""}`;
  const report = await perplexityProvider.sonar(query);
  return report;
}

async function advancedResearchReport(company: string, website?: string) {
  const config = useRuntimeConfig();
  const perplexity = new OpenAI({
    apiKey: config.perplexityApiKey,
    baseURL: "https://api.perplexity.ai",
  });

  const messages = [
    {
      "role": "system",
      "content": `You are an Customer Service Expert tasked with preparing comprehensive, high-quality background information for developing a playbook for call center agent. Your research must gather data exclusively from the company’s official website and be structured to ensure exceptional customer satisfaction. Complete each research step thoroughly before moving on to the next.

Firstly, establish the **Company Profile** by extracting detailed information from the company’s official domain. Include:
- An overview of the company, its mission, and core values.
- Descriptions of core services, products, and target customer demographics.
- Insights into common customer challenges and pain points.
- Localization notes such as local payment methods, regional holidays, and cultural business etiquette.

Secondly, generate a **FAQ Document** that presents a conversational Q&A format. Ensure the FAQs are grouped by topic and cover:
- Common customer inquiries and product/service-specific questions.
- Troubleshooting guides with empathetic responses and follow-up question scenarios.
- A minimum of 15–20 questions, each accompanied by internal notes for handling complex cases.

Thirdly, document the **Service Call Flow** by mapping out:
- Customer interaction points and corresponding emotional states.
- Decision trees for typical scenarios using clear if/then conditional logic.
- Verification steps with natural transitions and a balanced mix of open and closed questions (approximately a 60/40 ratio).
- Clear success and failure paths throughout the flow.

Fourthly, define the **Agent Persona** by outlining:
- Language style, tone variations, and cultural sensitivities.
- Response patterns that include brief, clear responses (15–30 words per response) with simulated pauses (1.5–2 seconds) and natural phrasing (using contractions and verbal acknowledgments).
- Guidelines for handling sensitive situations, escalation phrases, annotated example conversations, do’s and don’ts, and brand voice adherence.
- Localization elements like dialect, register, local measurement units, and currency formatting, as well as culturally appropriate metaphors and storytelling references.

Fifthly, compile the **Product and Service Catalog** by researching pricing, availability, and any special offers directly from the official website. If multiple product lines exist, repeat the process for each, ensuring accuracy and completeness.

Additionally, apply **Conversation Naturalization Techniques** to ensure that:
- Sentence lengths vary naturally and responses include strategic pauses.
- Transitions are smooth, tone adapts to customer emotions, and visual references are avoided in favor of verbal clarity.
- Clear next steps are provided before any transfers occur.

Finally, ensure that every step is completed and verified with built-in quality checks. The final report must be standalone, self-contained, and optimized for exceptional customer support while strictly adhering to localization and cultural context requirements.`
    },
    {
      "role": "user",
      "content": website
        ? `Prepare Customer Service Guide for ${company}\nWebsite: ${website}`
        : `Prepare Customer Service Guide for ${company}`,
    },
  ];

  // const model = "sonar-reasoning";
  const model = "sonar-deep-research";
  const response = await perplexity.chat.completions.create({
    model,
    messages,
  });

  return response.choices[0].message.content;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { company, website } = body;

  if (!company) {
    throw createError({
      statusCode: 400,
      statusMessage: "Company name is required",
    });
  }

  const basic = false;

  if (basic) {
    const report = await basicResearchReport(company, website);
    return report;
  } else {
    const report = await advancedResearchReport(company, website);
    return report;
  }
});
