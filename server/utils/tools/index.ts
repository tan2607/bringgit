import { sendSMSTool } from './sendSMS'
import { findNearestClinicsTool } from './findNearestClinics'
export * from './types'

export const tools = [
  sendSMSTool,
  findNearestClinicsTool
]

export type Tool = typeof sendSMSTool | typeof findNearestClinicsTool
export type ToolName = Tool['function']['name']
