export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)
  const { to, callResult } = body

  if (!to || !callResult) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameters: to, callResult'
    })
  }

  try {
    console.log('📱 WhatsApp Send Request:', {
      timestamp: new Date().toISOString(),
      to,
      callResult,
    })

    const endpoint = `https://prabhat.staging.keyreply.com/server/api/webhook`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${config.demoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        
      },
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
      message: 'Message sent successfully',
      messageId: result.sid,
      status: result.status,
      details: {
        to,
        callResult,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('❌ SMS Send Error:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    })

    return {
      success: false,
      message: error.message || 'Failed to send SMS',
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
})
