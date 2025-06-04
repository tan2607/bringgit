import { H3Event } from 'h3'
import { PromptEnhancer } from '@@/server/utils/providers/copilot'
import { SendGridProvider } from '@@/server/utils/providers/sendgrid'

interface Message {
  role: 'assistant' | 'user'
  message: string
}

interface EndOfCallReport {
  message: {
    type: 'end-of-call-report'
    endedReason: string
    call: any
    recordingUrl: string
    summary: string
    transcript: string
    messages: Message[]
  }
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<EndOfCallReport>(event)
    
    // Extract and log the summary
    console.log('Call Summary:', body.message.summary)

    // Initialize providers
    const promptEnhancer = new PromptEnhancer(process.env.OPENAI_API_KEY as string)
    const sendGrid = SendGridProvider.getInstance(process.env.SENDGRID_API_KEY as string)
    
    // Try to generate a calendar invite from the summary
    const calendarInvite = await promptEnhancer.generateCalendarInvite(body.message.summary)
    
    // If an appointment was detected, send the calendar invite
    if (calendarInvite) {
      console.log('Appointment detected, sending calendar invite...')
      const patientEmail = 'max@keyreply.com' // TODO: Get from call data
      await sendGrid.sendCalendarInvite(calendarInvite, patientEmail)
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error processing end-of-call report:', error)
    throw createError({
      statusCode: 400,
      message: error.message
    })
  }
})
