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


  const JobUpdate = async () => {
    const jobsData = await $fetch('/api/jobs')
    sendEvent({
      type: 'jobUpdate',
      jobs: jobsData
    })
  }

  

  // Send initial mock data
  await JobUpdate()

  // Periodically send mock updates
  const updateInterval = setInterval(JobUpdate, 30000)

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
