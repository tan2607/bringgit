import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Set headers for SSE
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  // Get client connection
  const { req, res } = event.node

  // Handle client disconnect
  req.on('close', () => {
    res.end()
  })

  // Create SSE response
  const writer = res.write.bind(res)
  const sendEvent = (data: any) => {
    writer(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Store connection in global connections map
  const clientId = crypto.randomUUID()
  globalThis.sseConnections = globalThis.sseConnections || new Map()
  globalThis.sseConnections.set(clientId, sendEvent)

  // Clean up on disconnect
  req.on('close', () => {
    globalThis.sseConnections.delete(clientId)
  })

  // Keep connection alive
  const keepAlive = setInterval(() => {
    sendEvent({ type: 'ping' })
  }, 30000)

  req.on('close', () => {
    clearInterval(keepAlive)
  })

  // Return nothing as we're handling the response manually
  return
})
