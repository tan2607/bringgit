export const findNearestClinicsTool = {
  type: "function",
  messages: [
    {
      type: "request-start",
      content: "I'll search for clinics near your location..."
    },
    {
      type: "request-complete",
      content: "Here are the nearest clinics:"
    },
    {
      type: "request-failed",
      content: "I couldn't find any clinics at the moment. Please try again later."
    },
    {
      type: "request-response-delayed",
      content: "Still searching for clinics in your area...",
      timingMilliseconds: 2000
    }
  ],
  function: {
    name: "findNearestClinics",
    parameters: {
      type: "object",
      required: ["searchQuery"],
      properties: {
        searchQuery: {
          type: "string",
          description: "The location or area to search for clinics (e.g., 'Tampines', 'Orchard Road')"
        },
        limit: {
          type: "number",
          description: "Maximum number of clinics to return (default: 3)",
          default: 3
        }
      }
    },
    description: "Find the nearest clinics based on a location search query"
  },
  async: false,
  server: {
    url: useRuntimeConfig()?.public?.baseUrl + "/api/tool"
  }
}
