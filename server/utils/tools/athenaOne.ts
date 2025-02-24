export const athenaOneTool = {
  type: "function",
  messages: [
    {
      type: "request-start",
      content: "I'll help you schedule an appointment with AthenaHealth. Please wait..."
    },
    {
      type: "request-complete",
      content: "Successfully retrieved the information from AthenaHealth!"
    },
    {
      type: "request-failed",
      content: "I couldn't complete the AthenaHealth request at this time. Please try again later."
    },
    {
      type: "request-response-delayed",
      content: "The request is taking longer than expected. Please wait...",
      timingMilliseconds: 2000
    }
  ],
  function: {
    name: "athenaOne",
    parameters: {
      type: "object",
      required: ["action", "practiceid"],
      properties: {
        action: {
          type: "string",
          enum: ["getDepartments", "getProviders", "getAppointmentReasons", "getAvailableAppointmentSlots", "bookAppointment"],
          description: "The AthenaHealth API action to perform"
        },
        practiceid: {
          type: "string",
          description: "The practice ID for the AthenaHealth API"
        },
        departmentid: {
          type: "string",
          description: "The department ID (required for providers, appointment reasons, and slots)"
        },
        providerid: {
          type: "string",
          description: "The provider ID (required for appointment reasons and slots)"
        },
        reasonid: {
          type: "string",
          description: "The appointment reason ID (required for slots)"
        },
        appointmentid: {
          type: "string",
          description: "The appointment ID (required for booking)"
        },
        patientData: {
          type: "object",
          description: "Patient information for booking appointments",
          properties: {
            firstname: {
              type: "string"
            },
            lastname: {
              type: "string"
            },
            dob: {
              type: "string",
              description: "Date of birth in YYYY-MM-DD format"
            },
            email: {
              type: "string"
            },
            phone: {
              type: "string"
            }
          }
        }
      }
    },
    description: "Interact with the AthenaHealth API to manage appointments, including viewing departments, providers, and booking appointments"
  },
  async: true,
  server: {
    url: useRuntimeConfig()?.public?.baseUrl + "/api/tool"
  }
}
