# AI Customer Support Agent Documentation Pipeline
This document outlines the process for preparing comprehensive background information necessary for an AI customer support agent. Each step includes specific requirements and quality checks to ensure consistent, high-quality output and exceptional customer satisfaction.

## Initial Setup
0. Create a folder for the company using the format: `./prompts/company_name`
   - Use lowercase with underscores for folder names
   - Initialize version control if not already present

## Document Generation Process

### 1. Company Profile (`1.intro.md`)
- Use web search to gather company information including:
  - About the company
  - Core services and products
  - Target customer demographics and pain points
  - Company values and mission
  - Common customer challenges and frustrations
+ Localization Requirements:
  - Country-specific details:
    * Common local payment methods
    * Regional holidays and observances
    * Local service expectations
  - Cultural context:
    * Communication formality norms
    * Local business etiquette

### 2. FAQ Document (`2.faq.md`)
- Generate comprehensive FAQ based on:
  - Common customer inquiries and pain points
  - Product/service-specific questions
  - Troubleshooting guides with empathetic responses
  - Anticipated follow-up questions
- Format requirements:
  - Use conversational Q&A format with clear headers
  - Group questions by topic
  - Include 15-20 most common questions minimum
  - Add internal notes for complex scenarios

### 3. Service Call Flow (`3.callflow.md`)
- Document the company's primary service flows:
  - Customer interaction points and emotional states
  - Decision trees for common scenarios
  - Required verification steps with natural transitions
- Format using:
  - Conditional logic (if/then statements)
  - Clear success/failure paths
  - Balance of open/closed questions (60/40 ratio)

### 4. Agent Persona (`4.persona.md`)
- Define the AI agent's personality:
  - Language style and tone variations
  - Cultural considerations and sensitivities
  - Response patterns and natural variations
  - Handling of sensitive situations
- Emotional Intelligence Requirements:
  - Acknowledge customer feelings before problem-solving
  - Empathy statements template library
  - Cultural sensitivity guidelines
  - Rapport building techniques
- Phone Communication Requirements:
  - Ideal response length: 1-2 sentences (15-30 words)
  - Pacing: 1.5-2 second response delay simulation
  - Verbal clarity techniques:
    * Avoid complex clauses
    * Use phonetic alphabet for spelling
    * Natural pause markers ("Let me check... one moment...")
  - Escalation path for complex issues:
    "I'll need to put you on brief hold to verify this"
    "Let me transfer you to a specialist who can help"
- Include:
  - Annotated example conversations
  - Do's and Don'ts with rationale
  - Brand voice guidelines
  - Controlled informality examples
- Quality check: 
  - Ensure no response exceeds 45 words without natural break points
  - Align with company brand guidelines and emotional intelligence standards
+ Localization Configuration:
  - Dialect and register selection:
    * Formal vs informal address rules
    * Region-specific vocabulary
    * Local measurement units
    * Currency formatting
  - Cultural adaptation:
    * Local storytelling references
    * Culturally appropriate metaphors
- Should not reply in numbered bullet points. use Firstly, secondly.... finally instead. 

### 5. Product and Service Catalog (`5.catalog.md`)
- Research and find the pricing information for the products and services.

Conversation Naturalization Techniques:
- Vary sentence length (mix short/long responses)
- Use controlled informality where appropriate
- Insert strategic pauses in response timing
- Allow graceful topic transitions
- Adapt tone based on customer emotional state
- Maintain consistent but natural personality
- Phone-specific naturalization:
  - Prefer contractions ("you'll" vs "you will")
  - Avoid visual references ("as shown below" → "as I explain")
- Add verbal acknowledgments ("I see", "Understood")
- Provide clear next steps before transfers

finally, run the following command to generate the final merged document:
```bash
cat *.md > merged.md
```

## Reminder
- This is a background research task; no programming or code generation required
- Focus on customer experience and support quality
- Optimize for highest possible customer satisfaction scores
- Each step must be completed and verified before proceeding
- The generated merged document is standalone and self-contained
- Critical localization elements:
  - Timezone-aware scheduling
  - Local emergency protocols and emergency phone numbers
  - Regional escalation paths
  - Culturally sensitive conflict resolution
