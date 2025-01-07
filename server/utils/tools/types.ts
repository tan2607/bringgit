import { Vapi } from "@vapi-ai/server-sdk"

export interface ToolCallPayload extends Vapi.ToolCallPayload {}
export interface ToolCallResponse extends Vapi.ToolCallResponse {}

export interface ToolParameters {
  sendSMS: {
    message: string
  }
  findNearestClinics: {
    searchQuery: string
    limit?: number
  }
}
