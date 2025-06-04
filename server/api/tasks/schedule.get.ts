import { and, or, eq, asc, not, inArray } from "drizzle-orm";
import { jobQueue, jobs } from "@@/server/database/schema";
import { CallMessage, CallQueueHandler } from "@@/server/utils/queue";
import _ from "lodash";

export default defineEventHandler(async (event) => {
  try {
    console.log("[Schedule] Job queues scheduled");
    const db = useDrizzle();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    const queueLimit = 1;
    const pendingJobs = await db.query.jobs.findMany({
      where: and(
        not(eq(jobs.status, "completed")),
        not(eq(jobs.status, "paused"))
      ),
      orderBy: asc(jobs.createdAt),
    });

    const jobIds = pendingJobs.map(job => job.id);

    const queues = await db.query.jobQueue.findMany({
      where: and(
        inArray(jobQueue.jobId, jobIds),
        not(eq(jobQueue.status, "completed"))
      ),
      orderBy: asc(jobQueue.updatedAt),
    });

    const nextDay = new Date(today);
    nextDay.setHours(23, 59, 59, 999);

    const todayQueues = queues.filter(({ scheduledAt, status }) => {
      const jobDate = new Date(scheduledAt || '');
      return jobDate < nextDay && status !== "completed";
    })

    const queuesByJobId = _.groupBy(todayQueues, 'jobId');  
    
    const pendingJobsById = new Map(pendingJobs.map(job => [job.id, job]));

    const jobIdsToProcess = Object.keys(queuesByJobId).map((jobId) => {
      const jobQueues = queuesByJobId[jobId].slice(0, queueLimit);
      const job = pendingJobsById.get(jobId);
      return {
        queues: jobQueues,
        job,
      };
    });
    const config = useRuntimeConfig();
    const queueHandler = new CallQueueHandler(
      config.vapiApiKey,
      event.context.cloudflare.queue
    );

    await Promise.all(
      jobIdsToProcess.map((batch) => {
        const messages = batch.queues.map((queue) => {
          const newQueue = {
            ...queue,
            assistantId: batch.job?.assistantId,
            scheduledAt: batch.job?.schedule,
            selectedTimeWindow: batch.job?.selectedTimeWindow,
            phoneNumbers: batch.job?.phoneNumberId,
          };
          if (queue.status === "failed") {
            newQueue.retryCount = (queue.retryCount || 0) + 1;
          }
          return newQueue;
        });
    
        return queueHandler.processBatch(messages);
      })
    );
    

    return {
      result: "success",
      queues: queuesByJobId,
      scheduledAt: new Date(),
    };
  } catch (error) {
    console.error("[Schedule] Error scheduling job queues", error);
    return {
      result: "error",
      error: error,
    };
  }
});
