import { H3Event } from "h3";
import { jobQueue, jobs } from "~/server/database/schema";

interface WebhookPayLoad {
  message: {
    status?: string;
    type: string;
    endedReason?: string;
    call?: {
      id: string;
      customer?: {
        number?: string;
      };
    };
  };
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<WebhookPayLoad>(event);
    const db = useDrizzle();
    const { message } = body;
    const webhookType = message.type;

    switch (webhookType) {
      case "end-of-call-report":
        return { success: true };
      case "status-update":
        const status = message.status;
        const endedReason = message.endedReason;
        const callId = message.call?.id;

        const callRetryReasons = [
          "sip-gateway-failed-to-connect-call",
          "customer-busy",
          "unknown-error",
          "call.in-progress.error-sip-telephony-provider-failed-to-connect-call",
        ];

        console.log(endedReason);

        if (!callId || !status || !endedReason) {
          return { success: true };
        }

        if (status === "ended" && callRetryReasons.includes(endedReason)) {
          const targetQueue = await db.query.jobQueue.findFirst({
            where: (jobQueue, { eq }) => eq(jobQueue.vapiId, callId),
          });

          if (!targetQueue || !targetQueue.jobId) {
            return { success: true, message: "Queue not found" };
          }

          const targetRetryCount = (targetQueue.retryCount || 0);

          if (targetRetryCount >= 3) {
            return { success: true, message: "Max retry count reached" };
          }
       
          await db
            .update(jobQueue)
            .set({
              status: "failed",
              updatedAt: new Date(),
              retryCount: targetRetryCount,
            })
            .where(eq(jobQueue.vapiId, callId));

          console.log(`Redial attempt: ${targetQueue.retryCount} for phone ${message.call?.customer?.number}`);

          const relatedJob = await db.query.jobs.findFirst({
            where: (jobs, { eq }) => eq(jobs.id, targetQueue.jobId as string),
          });

          if (!relatedJob) {
            return { success: true, message: "Job not found" };
          }

          let failedNumbers = [];
          if (relatedJob.failedNumbers) {
            failedNumbers = JSON.parse(relatedJob.failedNumbers);
          }

          if (!failedNumbers.includes(message.call?.customer?.number)) {
            failedNumbers.push(message.call?.customer?.number);
            relatedJob.failedCalls = (relatedJob.failedCalls || 0) + 1;
          }

          relatedJob.completedCalls = relatedJob.completedCalls
            ? relatedJob.completedCalls - 1
            : 0;
          relatedJob.failedNumbers = JSON.stringify(failedNumbers);
          relatedJob.status =
            relatedJob.completedCalls === relatedJob.totalCalls
              ? "completed"
              : "running";

          await db
            .update(jobs)
            .set({
              completedCalls: relatedJob.completedCalls,
              failedCalls: relatedJob.failedCalls,
              failedNumbers: relatedJob.failedNumbers,
              status: relatedJob.status,
              progress: Math.round((relatedJob.completedCalls / (relatedJob.totalCalls || 1)) * 100),
            })
            .where(eq(jobs.id, targetQueue.jobId as string));
        }

        return { success: true };
      default:
        return { success: true };
    }
  } catch (error: any) {
    console.error("Error processing webhook report:", error);
    throw createError({
      statusCode: 400,
      message: error.message,
    });
  }
});
