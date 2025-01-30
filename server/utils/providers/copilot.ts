import Groq from 'groq-sdk';

interface CalendarInvite {
  subject: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  organizer: {
    name: string;
    email: string;
  };
}

export class PromptEnhancer {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({
      apiKey,
    });
  }

  async updatePrompt(originalPrompt: string, instructions: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "llama-3.3-70b-specdec",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing and refining AI assistant prompts. Your task is to modify the original prompt according to the user's instructions. Keep the core functionality intact while incorporating the requested changes. Return only the modified prompt without any explanations or additional text."
        },
        {
          role: "user",
          content: `Original Prompt:\n${originalPrompt}\n\nInstructions for changes:\n${instructions}\n\nPlease provide the updated prompt.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || originalPrompt;
  }

  async generateCalendarInvite(summary: string): Promise<CalendarInvite | null> {
    // Default values for the appointment
    const defaults = {
      subject: "Sleep Consultation Appointment",
      duration: 60, // minutes
      location: "Vitalus Health, 2727 Allen Parkway Ste. 1915, Houston, TX 77019",
      organizer: {
        name: "Vitalus Health",
        email: "max@keyreply.com"
      }
    };

    // Use GPT to extract appointment details from the summary
    const response = await this.client.chat.completions.create({
      model: "llama-3.3-70b-specdec",
      messages: [
        {
          role: "system",
          content: `Analyze if the conversation summary contains an appointment scheduling. If it does, extract the details and return a JSON object with these fields:
            - hasAppointment (boolean): whether an appointment was scheduled
            - subject (string): appointment type/purpose
            - date (string in YYYY-MM-DD format): appointment date
            - time (string in HH:mm format, 24hr): appointment start time
            - duration (number in minutes): appointment duration
            Return null for fields if they cannot be determined.`
        },
        {
          role: "user",
          content: summary
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    // Parse the extracted details
    const extracted = JSON.parse(response.choices[0].message.content || "{}");
    
    // If no appointment was scheduled, return null
    if (!extracted.hasAppointment) {
      console.log('No appointment scheduling detected in summary');
      return null;
    }
    
    // Set up the appointment time
    let startTime = new Date();
    if (extracted.date && extracted.time) {
      startTime = new Date(`${extracted.date}T${extracted.time}`);
    } else {
      // Default to next business day at 9:00 AM
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(9, 0, 0, 0);
      // If it's a weekend, move to Monday
      if (startTime.getDay() === 0) startTime.setDate(startTime.getDate() + 1);
      if (startTime.getDay() === 6) startTime.setDate(startTime.getDate() + 2);
    }

    // Calculate end time
    const duration = extracted.duration || defaults.duration;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Construct the calendar invite
    const invite: CalendarInvite = {
      subject: extracted.subject || defaults.subject,
      startTime,
      endTime,
      location: defaults.location,
      description: `Your appointment has been scheduled at Vitalus Health.\n\n` +
        `Please arrive 15 minutes before your scheduled time.\n\n` +
        `If you need to reschedule, please call us at (281) 968-2300.\n\n` +
        `Original conversation summary:\n${summary}`,
      organizer: defaults.organizer
    };

    return invite;
  }

  async analyzeData(question: string, data: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "deepseek-r1-distill-llama-70b",
      messages: [
        {
          role: "system",
          content: `You are a data analysis expert. Your task is to analyze CSV data and answer questions about it accurately and concisely. 
          Always show your reasoning process and calculations. Format numerical values appropriately (e.g., currency with 2 decimal places).
          If the question cannot be answered with the given data, explain why.`
        },
        {
          role: "user",
          content: `CSV Data:\n${data}\n\nQuestion: ${question}\n\nPlease analyze the data and answer the question.`
        }
      ],
      temperature: 0.6,
      max_tokens: 2048,
    });

    return response.choices[0].message.content || "Sorry, I couldn't analyze the data.";
  }

  async formatToMarkdown(text: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert at formatting text into clean, well-structured markdown. Format the given text into markdown with appropriate headers, lists, and emphasis. Return only the markdown without any explanations."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content || text;
  }
}

export class GroqOCR {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({
      apiKey,
    });
  }

  async processDocument(dataUrl: string): Promise<Record<string, any>> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all relevant information from this document and return it as a JSON object. Include all important details like dates, names, addresses, amounts, and any other significant information. Format the response as a clean JSON object with appropriate key-value pairs."
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        model: "llama-3.2-90b-vision-preview",
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('Groq OCR Error:', error);
      throw error;
    }
  }
}
