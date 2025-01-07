export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { accountSid, authToken, fromNumber } = config.twilio

  if (!accountSid || !authToken || !fromNumber) {
    throw createError({
      statusCode: 500,
      message: 'Missing Twilio configuration'
    })
  }

  const body = await readBody(event)
  const { to, message } = body

  if (!to || !message) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameters: to, message'
    })
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const encoded = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    })

    const token = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encoded,
    })

    const result = await response.json()

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: result.message || 'Failed to send SMS'
      })
    }

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
