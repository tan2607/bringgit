// pages/api/calls.ts
import { VapiClient } from '@vapi-ai/server-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const client = new VapiClient({ 
    token: config.vapiApiKey
  })

  try {
    const calls = await client.calls.list()
    const filteredCalls = calls.map(call => ({
      id: call.id,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      transcript: call.transcript,
      summary: call.summary,
      recordingUrl: call.recordingUrl
    }))
    return filteredCalls
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch calls'
    })
  }
})