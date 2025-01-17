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

  // Mock job updates
  const mockJobUpdate = () => {
    const mockJobs = Array.from({ length: 3 }, (_, i) => ({
      id: `job-${i + 1}`,
      name: `Test Job ${i + 1}`,
      status: Math.random() > 0.7 ? 'paused' : 'running',
      progress: Math.min(100, Math.floor(Math.random() * 100)),
      completedCalls: Math.floor(Math.random() * 50),
      totalCalls: 50,
      schedule: new Date().toISOString()
    }))

    sendEvent({
      type: 'jobUpdate',
      jobs: mockJobs
    })
  }

  // Send initial mock data
  mockJobUpdate()

  // Periodically send mock updates
  const updateInterval = setInterval(mockJobUpdate, 30000)

  // Keep connection alive with ping
  const keepAlive = setInterval(() => {
    sendEvent({ type: 'ping' })
  }, 45000)

  req.on('close', () => {
    clearInterval(keepAlive)
    clearInterval(updateInterval)
  })

  // Return nothing as we're handling the response manually
  return
})
