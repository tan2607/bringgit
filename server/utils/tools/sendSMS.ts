export const sendSMSTool = {
  type: "function",
  messages: [
    {
      type: "request-start",
      content: "I'll send an SMS message for you. Please wait..."
    },
    {
      type: "request-complete",
      content: "SMS has been sent successfully!"
    },
    {
      type: "request-failed",
      content: "I couldn't send the SMS message at this time. Please try again later."
    },
    {
      type: "request-response-delayed",
      content: "The SMS is taking longer than expected to send. Please wait...",
      timingMilliseconds: 2000
    }
  ],
  function: {
    name: "sendSMS",
    parameters: {
      type: "object",
      required: ["to", "message"],
      properties: {
        to: {
          type: "string",
          description: "The phone number to send the SMS to (in E.164 format, e.g., +6512345678)"
        },
        message: {
          type: "string",
          description: "The message content to send"
        }
      }
    },
    description: "Sends an SMS message to the specified phone number using Twilio"
  },
  async: false,
  server: {
    url: "https://next.keyreply.com/api/tool"
  }
}
