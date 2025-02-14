import { jobs } from '~/server/database/schema';
import { CallQueueHandler, CallMessage } from '../../utils/queue'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const db = useDrizzle();
    const { jobId, phoneNumbers, assistantId, phoneNumberId, scheduledAt } = body

    if (!jobId || !phoneNumbers || !assistantId || !phoneNumberId) {
      throw new Error('Missing required fields')
    }

    const queueHandler = new CallQueueHandler(
      config.vapiApiKey,
      event.context.cloudflare.queue,
    )

    // Create messages for each phone number
    const messages: CallMessage[] = phoneNumbers.map(phoneNumber => ({
      jobId,
      phoneNumber,
      assistantId,
      phoneNumberId,
      retryCount: 0,
      scheduledAt
    }))

    // Enqueue all messages
    await queueHandler.enqueueJobBatch(messages)

    // Update job status to running
    const shouldRun = scheduledAt && new Date(scheduledAt).getTime() < Date.now() 
    if(shouldRun) {
      await db.update(jobs).set({ status: "running" }).where(eq(jobs.id, jobId))
    }
    
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
