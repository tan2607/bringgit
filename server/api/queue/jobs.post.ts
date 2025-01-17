import { CallQueueHandler, CallMessage } from '../../utils/queue'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { jobId, phoneNumbers, assistantId, phoneNumberId } = body

    if (!jobId || !phoneNumbers || !assistantId || !phoneNumberId) {
      throw new Error('Missing required fields')
    }

    const queueHandler = new CallQueueHandler(
      event.context.cloudflare.queue,
      config.vapiApiKey
    )

    // Create messages for each phone number
    const messages: CallMessage[] = phoneNumbers.map(phoneNumber => ({
      jobId,
      phoneNumber,
      assistantId,
      phoneNumberId,
      retryCount: 0
    }))

    // Enqueue all messages
    await queueHandler.enqueueJobBatch(messages)

    return {
      success: true,
      message: `Enqueued ${phoneNumbers.length} calls for job ${jobId}`
    }

  } catch (error: any) {
    console.error('Error queueing job:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
