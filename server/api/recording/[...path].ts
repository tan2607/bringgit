import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const path = event.context.params.path
  
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing file path'
    })
  }

  // Construct the original VAPI URL
  const originalUrl = `https://storage.vapi.ai/${path}`

  try {
    // Fetch the file from VAPI
    const response = await fetch(originalUrl)
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch recording'
      })
    }

    // Get the response as array buffer
    const buffer = await response.arrayBuffer()

    // Set appropriate headers
    event.node.res.setHeader('Content-Type', 'audio/mpeg')
    event.node.res.setHeader('Content-Disposition', `attachment; filename="recording-${path.split('/').pop()}"`)

    return Buffer.from(buffer)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy recording'
    })
  }
})
