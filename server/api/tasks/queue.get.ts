import { jobs } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const config = useRuntimeConfig();
    const queueHandler = new CallQueueHandler(config.vapiApiKey, event.context.cloudflare.queue);

    // Get pending/running jobs with remaining calls to process
    const pendingJobs = await db.query.jobs.findMany({
      where: or(eq(jobs.status, "pending"), eq(jobs.status, "running")),
      with: {
        jobQueues: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [asc(jobs.createdAt)],
    });

    const jobsToProcess = pendingJobs
      .filter(job => (job.totalCalls ?? 0) - (job.jobQueues?.length ?? 0) > 0)
      .map(job => ({
        ...job,
        remainingCalls: (job.totalCalls ?? 0) - (job.jobQueues?.length ?? 0)
      }));

    // Process jobs in parallel with batched messages
    await Promise.all(jobsToProcess.map(async job => {
      const { id, phoneNumbers, names, assistantId, phoneNumberId, schedule, selectedTimeWindow } = job;
      const queueLength = job.jobQueues?.length ?? 0;
      
      // Parse job data
      const parsedData = {
        phoneNumbers: JSON.parse(phoneNumbers || "[]").slice(queueLength, queueLength + 10),
        names: JSON.parse(names || "[]").slice(queueLength, queueLength + 10),
        timeWindow: JSON.parse(selectedTimeWindow || "[]")
      };

      // Create messages batch
      const messages = parsedData.phoneNumbers.map((phoneNumber, index) => ({
        jobId: id,
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
