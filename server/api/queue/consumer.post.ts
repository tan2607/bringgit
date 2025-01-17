import { CallQueueHandler } from '../../utils/queue'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  // Verify request is from CloudFlare
  // You should implement proper authentication here
  
  const queueHandler = new CallQueueHandler(
    event.context.cloudflare.queue,
    config.vapiApiKey
  )

  try {
    await queueHandler.processBatch(body.messages)
    return { success: true }
  } catch (error: any) {
    console.error('Error processing queue batch:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
