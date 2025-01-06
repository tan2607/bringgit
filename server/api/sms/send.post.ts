import twilio from 'twilio'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { accountSid, authToken, fromNumber } = config.twilio

  if (!accountSid || !authToken || !fromNumber) {
    throw createError({
      statusCode: 500,
      message: 'Missing Twilio configuration'
    })
  }

  const client = twilio(accountSid, authToken)
  const body = await readBody(event)
  const { to, message } = body

  if (!to || !message) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameters: to, message'
    })
  }

  try {
    const result = await client.messages.create({
      body: message,
      to,
      from: fromNumber
    })

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    }
  } catch (error: any) {
    console.error('Failed to send SMS:', error)
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to send SMS'
    })
  }
})
