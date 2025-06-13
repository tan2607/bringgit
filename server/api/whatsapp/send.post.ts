export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const body = await readBody(event)
    const { to, appointment_date, appointment_time } = body
  
    if (!to || !appointment_date || !appointment_time) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: to, appointment_date, appointment_time'
      })
    }
  
    try {
      console.log('📱 WhatsApp Send Request:', {
        timestamp: new Date().toISOString(),
        to,
        appointment_date,
        appointment_time,
      })
  
      const endpoint = `https://genai-dev.staging.keyreply.com/server/api/webhook`
    
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${config.demoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
            "recipient_id": "13134990961",
            "sender_id": "6590933395", //+6590933395
            "event": "capture",
                "data": {
                "key": "appointment_date",
                "value": appointment_date || '16th May 2025',
                "next": {
                    "type": "event",
                    "event": "capture",
                    "data": {
                        "key": "appointment_time",
                        "value": appointment_time || '4:00 pm',
                        "next": {
                            "type": "event",
                            "event": "goto",
                            "data": "whatsapp_confirmation"
                        }
                    }
                }
            }
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
          appointment_date,
          appointment_time,
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
  