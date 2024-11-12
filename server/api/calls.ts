// pages/api/calls.ts
import { VapiClient } from '@vapi-ai/server-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const client = new VapiClient({ 
    token: config.vapiApiKey
  })

  try {
    const calls = await client.calls.list()
    return calls
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch calls'
    })
  }
})