import { not } from "drizzle-orm";
import { jobQueue, jobs } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const config = useRuntimeConfig();
    const queueHandler = new CallQueueHandler(config.vapiApiKey, event.context.cloudflare.queue);

    // Get pending/running jobs with remaining calls to process
    const pendingJobs = await db
    .select({
      jobId: jobs.id,
      status: jobs.status,
      createdAt: jobs.createdAt,
      phoneNumbers: jobs.phoneNumbers,
      names: jobs.names,
      assistantId: jobs.assistantId,
      phoneNumberId: jobs.phoneNumberId,
      schedule: jobs.schedule,
      selectedTimeWindow: jobs.selectedTimeWindow,
      totalCalls: jobs.totalCalls,
      totalJobQueues: sql<number>`COUNT(${jobQueue.id})`
    })
    .from(jobs)
    .leftJoin(jobQueue, eq(jobs.id, jobQueue.jobId)) // Assuming jobQueues has jobId FK
    .where(not(eq(jobs.status, "completed")))
    .groupBy(jobs.id)
    .orderBy(asc(jobs.createdAt));

    const jobsToProcess = pendingJobs
      .filter(job => (job.totalCalls ?? 0) - (job.totalJobQueues ?? 0) > 0)
      .map(job => ({
        ...job,
        remainingCalls: (job.totalCalls ?? 0) - (job.totalJobQueues ?? 0)
      }));

    // Process jobs in parallel with batched messages
    await Promise.all(jobsToProcess.map(async job => {
      const { jobId, phoneNumbers, names, assistantId, phoneNumberId, schedule, selectedTimeWindow } = job;
      const queueLength = job.totalJobQueues ?? 0;
      
      // Parse job data
      const parsedData = {
        phoneNumbers: JSON.parse(phoneNumbers || "[]").slice(queueLength, queueLength + 10),
        names: JSON.parse(names || "[]").slice(queueLength, queueLength + 10),
        timeWindow: JSON.parse(selectedTimeWindow || "[]")
      };

      // Create messages batch
      const messages = parsedData.phoneNumbers.map((phoneNumber, index) => ({
        jobId,
        phoneNumber,
        name: parsedData.names[index],
        assistantId,
        phoneNumberId,
        retryCount: 0,
        scheduledAt: schedule,
        selectedTimeWindow: parsedData.timeWindow,
        status: "pending",
        delay: 0,
        vapiId: null
      }));

      await queueHandler.enqueueJobBatch(messages);
    }));

    return { pendingJobMissingQueues: jobsToProcess };

  } catch (error) {
    console.error("Error processing queue:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to process queue"
    });
  }
});
