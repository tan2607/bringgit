export interface ToolParameters {
  sendSMS: {
    message: string
  }
  findNearestClinics: {
    searchQuery: string
    limit?: number
  }
}
