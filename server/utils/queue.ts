import { Queue, QueueMessage } from '@cloudflare/workers-types'
import { VapiProvider } from './providers/vapi'
import { JobStorage, JobStatus } from './jobStorage'
import { RateLimiter } from './rateLimiter'
import { Scheduler } from './scheduler'

export interface CallMessage {
  jobId: string
  phoneNumber: string
  assistantId: string
  phoneNumberId: string
  retryCount?: number
  priority?: number
}

export class CallQueueHandler {
  private queue: Queue
  private vapi: VapiProvider
  private storage: JobStorage
  private rateLimiter: RateLimiter
  private scheduler: Scheduler

  constructor(queue: Queue, vapiApiKey: string, storage: JobStorage) {
    this.queue = queue
    this.vapi = new VapiProvider(vapiApiKey)
    this.storage = storage
    this.rateLimiter = new RateLimiter({
      maxConcurrentCallsPerJob: 1,
      maxGlobalConcurrentCalls: 10
    })
    
    // Initialize scheduler with default business hours
    this.scheduler = new Scheduler({
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Asia/Singapore'
      },
      blackoutPeriods: [],
      priorityWindows: [
        {
          startTime: '09:00',
          endTime: '11:00',
          priority: 1
        },
        {
          startTime: '14:00',
          endTime: '16:00',
          priority: 2
        }
      ],
      defaultPriority: 3
    })
  }

  private validatePhoneNumber(number: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(number)
  }

  async validateAndEnqueue(message: CallMessage): Promise<boolean> {
    if (!this.validatePhoneNumber(message.phoneNumber)) {
      await this.updateJobProgress(message.jobId, {
        failedNumbers: [message.phoneNumber],
        error: `Invalid phone number: ${message.phoneNumber}`
      })
      return false
    }

    // Check if current time is valid for scheduling
    const validation = this.scheduler.validateSchedule(new Date())
    if (!validation.isValid) {
      // Schedule for next available time
      const nextTime = this.scheduler.getNextAvailableTime()
      const delay = nextTime.getTime() - Date.now()
      
      await this.queue.send(message, { delay: Math.max(0, delay / 1000) })
      return true
    }

    // Get current priority
    const priority = this.scheduler.getCurrentPriority()
    await this.queue.send({ ...message, priority })
    return true
  }

  async enqueueJobBatch(messages: CallMessage[]) {
    const validMessages = []
    const invalidNumbers = []

    for (const message of messages) {
      if (this.validatePhoneNumber(message.phoneNumber)) {
        validMessages.push(message)
      } else {
        invalidNumbers.push(message.phoneNumber)
      }
    }

    if (invalidNumbers.length > 0) {
      await this.updateJobProgress(messages[0].jobId, {
        failedNumbers: invalidNumbers,
        error: `Invalid phone numbers found: ${invalidNumbers.join(', ')}`
      })
    }

    if (validMessages.length > 0) {
      await Promise.all(validMessages.map(async msg => {
        await this.validateAndEnqueue(msg)
      }))
    }

    return {
      enqueued: validMessages.length,
      failed: invalidNumbers.length
    }
  }

  async processMessage(message: QueueMessage<CallMessage>) {
    const { jobId, phoneNumber, assistantId, phoneNumberId, retryCount = 0 } = message.body
    
    // Check if we should process this message now
    const validation = this.scheduler.validateSchedule(new Date())
    if (!validation.isValid) {
      // Requeue for next available time
      const nextTime = this.scheduler.getNextAvailableTime()
      const delay = nextTime.getTime() - Date.now()
      
      await this.queue.send(message.body, { delay: Math.max(0, delay / 1000) })
      await message.ack()
      return
    }

    // Try to acquire a slot for this job
    if (!await this.rateLimiter.acquireJobSlot(jobId)) {
      // If we can't get a slot, requeue the message with a delay
      await this.queue.send(message.body, { delay: 5 })
      await message.ack()
      return
    }
    
    try {
      console.log(`Processing call for job ${jobId} to number ${phoneNumber}`)
      
      const call = await this.vapi.client.calls.create({
        assistantId,
        phoneNumberId,
        customer: {
          number: phoneNumber,
          numberE164CheckEnabled: false
        }
      })

      await this.updateJobProgress(jobId, {
        completedCalls: 1
      })

      console.log(`Successfully initiated call ${call.id} for job ${jobId}`)
      await message.ack()

    } catch (error: any) {
      console.error(`Error processing call for job ${jobId}:`, error)

      // If we haven't exceeded max retries, requeue the message
      if (retryCount < 3) {
        const nextTime = this.scheduler.getNextAvailableTime()
        const delay = Math.max(5, (nextTime.getTime() - Date.now()) / 1000)
        
        const retryMessage: CallMessage = {
          ...message.body,
          retryCount: retryCount + 1
        }
        await this.queue.send(retryMessage, { delay })
        console.log(`Requeued call for job ${jobId} (retry ${retryCount + 1}/3)`)
      } else {
        await this.updateJobProgress(jobId, {
          failedNumbers: [phoneNumber],
          error: error.message
        })
        console.error(`Max retries exceeded for job ${jobId}, call to ${phoneNumber}`)
      }

      await message.ack()
    } finally {
      await this.rateLimiter.releaseJobSlot(jobId)
    }
  }

  async processBatch(batch: QueueMessage<CallMessage>[]) {
    await Promise.all(batch.map(msg => this.processMessage(msg)))
  }

  private async updateJobProgress(jobId: string, update: {
    completedCalls?: number
    failedNumbers?: string[]
    error?: string
  }) {
    const job = await this.storage.getJob(jobId)
    if (!job) return

    const newStatus: JobStatus = {
      status: job.status,
      progress: job.progress,
      completedCalls: job.completedCalls + (update.completedCalls || 0),
      failedCalls: job.failedCalls + (update.failedNumbers?.length || 0),
      failedNumbers: [...(job.failedNumbers || []), ...(update.failedNumbers || [])],
      lastProcessedAt: new Date(),
      lastError: update.error
    }

    // Update progress percentage
    newStatus.progress = Math.round(
      (newStatus.completedCalls / job.totalCalls) * 100
    )

    // Check if job is completed
    if (newStatus.completedCalls + newStatus.failedCalls >= job.totalCalls) {
      newStatus.status = newStatus.failedCalls === job.totalCalls ? 'failed' : 'completed'
    }

    await this.storage.updateJobStatus(jobId, newStatus)
  }
}
