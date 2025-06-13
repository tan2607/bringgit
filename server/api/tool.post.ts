import { tools } from '../utils/tools'
import { Vapi } from "@vapi-ai/server-sdk"

export default defineEventHandler(async (event) => {
  try {
    // Verify Vapi secret token
    const config = useRuntimeConfig()
    const secretToken = getHeader(event, 'x-vapi-secret')

    if (!secretToken || secretToken !== config.vapiSecret) {
      console.error('Invalid or missing secret token')
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: Invalid or missing secret token'
      })
    }

    const body = await readBody(event)

    console.log(body);
    
    // Validate message exists
    if (!body.message) {
      throw createError({
        statusCode: 400,
        message: 'Missing message in request body'
      })
    }

    const message: Vapi.ServerMessageToolCalls = body.message

    if (message.type !== 'tool-calls' || !message.toolCallList?.length) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request: Expected tool-calls message type with toolCallList'
      })
    }

    console.log(`Processing ${message.toolCallList.length} tool calls`)

    const results = await Promise.all(message.toolCallList.map(async (toolCall) => {
      const { id: toolCallId, function: { name, arguments: parameters } } = toolCall

      console.log(`Processing tool call ${toolCallId}: ${name}`)

      // Find the tool configuration
      const tool = tools.find(t => t.function.name === name)
      if (!tool) {
        console.error(`Tool "${name}" not found`)
        throw createError({
          statusCode: 404,
          message: `Tool "${name}" not found`
        })
      }

      let result: string

      try {
        // Handle different tools
        switch (name) {
          case 'send_appointment_confirmation': {
            const customerNumber = message.customer?.number || message.call?.customer?.number || parameters.to
            const appointment_date = parameters.appointment_date
            const appointment_time = parameters.appointment_time

            if (!customerNumber) {
              throw createError({
                statusCode: 400,
                message: 'Customer phone number not found'
              })
            }

            // Call the WhatsApp endpoint
            await $fetch('/api/whatsapp/send', {
              method: 'POST',
              body: {
                to: customerNumber,
                appointment_date,
                appointment_time
              }
            })

            result = `Confirmation sent successfully to ${customerNumber}`
            break
          }
          case 'sendSMS': {
            const customerNumber = message.customer?.number || message.call?.customer?.number || parameters.to

            if (!customerNumber) {
              throw createError({
                statusCode: 400,
                message: 'Customer phone number not found'
              })
            }

            if (!parameters.message) {
              throw createError({
                statusCode: 400,
                message: 'Message content is required'
              })
            }

            // Call the SMS endpoint
            await $fetch('/api/sms/send', {
              method: 'POST',
              body: {
                to: customerNumber,
                message: parameters.message
              }
            })

            result = `SMS sent successfully to ${customerNumber}`
            break
          }
          case 'findNearestClinics': {
            const { searchQuery, limit = 3 } = parameters

            if (!searchQuery) {
              throw createError({
                statusCode: 400,
                message: 'Search query is required'
              })
            }

            // Call the nearest clinics endpoint
            const response = await $fetch(`/api/clinics/nearest?searchQuery=${encodeURIComponent(searchQuery as string)}&limit=${limit}`)

            if (!response.success || !response.data?.length) {
              result = "No clinics found in the specified location."
            } else {
              const clinics = response.data
              result = "Here are the nearest clinic locations.\n\n" + clinics.map((clinic: any) => 
                `${clinic.description}\n${clinic.name}`
              ).join('\n\n')
            }
            break
          }
          default:
            throw createError({
              statusCode: 400,
              message: `Tool "${name}" is not implemented`
            })
        }

        console.log(`Tool call ${toolCallId} completed successfully`)
        return { toolCallId, result }
      } catch (error: any) {
        console.error(`Error processing tool call ${toolCallId}:`, error)
        throw error
      }
    }))

    return { results }
  } catch (error: any) {
    console.error('Tool execution error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to execute tool'
    })
  }
})
