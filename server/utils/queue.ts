import { Queue, QueueMessage } from '@cloudflare/workers-types'
import { VapiProvider } from './providers/vapi'
import { JobStorage, JobStatus } from './jobStorage'
import { RateLimiter } from './rateLimiter'
import { Scheduler } from './scheduler'
import { jobQueue, jobs } from '../database/schema'


export interface CallMessage {
  id?: string
  jobId: string
  phoneNumber: string
  name: string
  assistantId: string
  phoneNumberId: string
  retryCount?: number
  priority?: number
  status: string
  delay: number
  scheduledAt: string
  vapiId: string
  selectedTimeWindow: { start: string, end: string }
}

export class CallQueueHandler {
  private vapi: VapiProvider
  private storage: JobStorage
  private rateLimiter: RateLimiter
  private scheduler: Scheduler

  constructor(vapiApiKey: string, storage: JobStorage) {
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

    const scheduler = new Scheduler({
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: message.selectedTimeWindow.start,
        endTime: message.selectedTimeWindow.end,
        timezone: 'Asia/Singapore'
      },
      blackoutPeriods: [],
      priorityWindows: [],
      defaultPriority: 3
    })

    // Check if the job is today or in the future
    const today = new Date()
    const jobDate = new Date(message.scheduledAt)
    if (jobDate > today) {
      await this.sendToQueue(message)
      return true
    }

    const validation = scheduler.validateSchedule(new Date())
    if (!validation.isValid) {
      const nextTime = scheduler.getNextAvailableTime()
      console.log(validation.reason);
      console.log("Scheduling for next available time", nextTime)
      message.scheduledAt = new Date(nextTime).toISOString();
      await this.sendToQueue(message)
      return true
    }

    // Get current priority
    const priority = this.scheduler.getCurrentPriority()
    await this.sendToQueue({ ...message, priority })
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
    const { jobId, phoneNumber, assistantId, phoneNumberId, retryCount = 0, id: queueId, delay, scheduledAt, name } = message;
    const db = useDrizzle();
    const selectedTimeWindow = JSON.parse(message.selectedTimeWindow);

    const scheduler = new Scheduler({
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: selectedTimeWindow.start,
        endTime: selectedTimeWindow.end,
        timezone: 'Asia/Singapore'
      },
      blackoutPeriods: [],
      priorityWindows: [],
      defaultPriority: 3
    })

    const validation = scheduler.validateSchedule(new Date())
    if (!validation.isValid) {
      const nextTime = scheduler.getNextAvailableTime()
      message.scheduledAt = new Date(nextTime).toISOString();
      await this.sendToQueue(message)
      return
    }

    // Try to acquire a slot for this job
    if (!await this.rateLimiter.acquireJobSlot(jobId)) {
      // If we can't get a slot, requeue the message with a delay
      await this.sendToQueue(message, { delay: 5 })
      // await message.ack()
      return
    }
    console.log("Processing call for job", jobId);    

    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
    if (job?.status === "pending") {
      await db.update(jobs).set({ status: "running" }).where(eq(jobs.id, jobId))
    }

    try {
      // @todo: find a way to do it via vapi {{now}} or separate greeting logic
      const hour = parseInt(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore', hour: '2-digit', hour12: false }));
      let greeting;
      if (hour < 12) {
        greeting = "Good Morning";
      } else if (hour < 18) {
        greeting = "Good Afternoon";
      } else if (hour < 21) {
        greeting = "Good Evening";
      } else {
        greeting = "Good Night";
      }
      
      console.log(`Processing call for job ${jobId} to number ${phoneNumber} with variables:`, {name, greeting})
      
      const call = await this.vapi.client.calls.create({
        assistantId,
        phoneNumberId,
        customer: {
          number: phoneNumber,
          numberE164CheckEnabled: false
        },
        assistantOverrides: {
          variableValues: {
            name,
            greeting
          }
        }
      })

      await this.updateJobProgress(jobId, {
        completedCalls: 1
      })

      console.log(`Successfully initiated call ${call.id} for job ${jobId}`)

      await this.updateQueue({
        ...message,
        id: queueId,
        status: "completed",
        vapiId: call.id
      })
      // await message.ack()

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
        await this.sendToQueue(retryMessage, { delay })
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
    if(batch.length === 0) return;
    await Promise.all(batch.map(msg => this.processMessage(msg)))
  }

  private async updateJobProgress(jobId: string, update: {
    completedCalls?: number
    failedNumbers?: string[]
    error?: string
  }) { 
    const db = useDrizzle();

    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId)
    })

    if (!job) return

    const newStatus: JobStatus = {
      status: job.status,
      progress: job.progress,
      completedCalls: job.completedCalls + (update.completedCalls || 0),
      failedCalls: job.failedCalls + (update.failedNumbers?.length || 0),
      lastProcessedAt: new Date(),
      lastError: update.error
    }

    // Update progress percentage
    newStatus.progress = Math.round(
      (newStatus.completedCalls / job.totalCalls) * 100
    )

    // Check if job is completed
    newStatus.status = newStatus.completedCalls === job.totalCalls ? 'completed' : 'running'

    // update the job
    const updatedJob = await db.update(jobs).set({
      status: newStatus.status,
      progress: newStatus.progress,
      completedCalls: newStatus.completedCalls,
      failedCalls: newStatus.failedCalls,
    }).where(eq(jobs.id, jobId))

    return updatedJob;
  }

  private async sendToQueue(message: CallMessage, options?: { delay?: number }) {
    const retries = 5;
    const delay = options?.delay || 0;
  
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (message.id) {
          message.status = "pending";
          message.delay = delay;
          await this.updateQueue(message);
          return;
        }
  
        const db = useDrizzle();
        const queuePayload = {
          jobId: message.jobId,
          phoneNumber: message.phoneNumber,
          assistantId: message.assistantId,
          phoneNumberId: message.phoneNumberId,
          name: message.name,
          retryCount: message.retryCount,
          priority: message.priority,
          id: crypto.randomUUID(),
          delay,
          status: "pending",
          scheduledAt: message.scheduledAt,
          vapiId: null,
          selectedTimeWindow: JSON.stringify(message.selectedTimeWindow),
        };
  
        await db.insert(jobQueue).values(queuePayload as any);
        return;
      } catch (error) {
        console.error(
          `Failed to send message to queue (Attempt ${attempt + 1}/${retries}): ${message.phoneNumber} | Error: ${error}`
        );
        if (attempt < retries - 1) {
          await new Promise(res => setTimeout(res, 100 * (2 ** attempt))); // Exponential backoff
        }
      }
    }
      console.error(`Failed to queue message after ${retries} attempts: ${message.phoneNumber}`);
    }


  private async updateQueue(message: CallMessage) {
    const db = useDrizzle();
    await db.update(jobQueue).set({
      status: message.status as "pending" | "completed" | "failed" | "running" | undefined || "pending",
      delay: message.delay || 0,
      vapiId: message.vapiId || null,
      scheduledAt: message.scheduledAt || null
    }).where(eq(jobQueue.id, message.id as string))
  }
}
