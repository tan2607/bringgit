import { sendSMSTool } from './sendSMS'
import { findNearestClinicsTool } from './findNearestClinics'
import { athenaOneTool } from './athenaOne'
export * from './types'

export const tools = [
  sendSMSTool,
  findNearestClinicsTool,
  athenaOneTool
]

export type Tool = typeof sendSMSTool | typeof findNearestClinicsTool | typeof athenaOneTool
export type ToolName = Tool['function']['name']
