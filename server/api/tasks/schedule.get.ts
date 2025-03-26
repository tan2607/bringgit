import { and, or, eq, asc,  not } from "drizzle-orm";
import { jobQueue, jobs } from "~/server/database/schema";
import { CallQueueHandler } from "~/server/utils/queue";

export default defineEventHandler(async (event) => {
	try {
		console.log("[Schedule] Job queues scheduled");
		const db = useDrizzle();
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to start of the day

		const queueLimit = 1;
		const pendingJobs = await db.query.jobs.findMany({
			where: and(
				or(eq(jobs.status, "pending"), eq(jobs.status, "running"))
			),
			orderBy: asc(jobs.createdAt), // Ensure sorting at the job level
			with: {
				jobQueues: {
					orderBy: asc(jobQueue.createdAt), // Ensure sorting inside relations
					limit: queueLimit,
					where: not(eq(jobs.status, "completed")), 
				},
			},
		});

		const config = useRuntimeConfig();
		const queueHandler = new CallQueueHandler(config.vapiApiKey, event.context.cloudflare.queue);

		const nextDay = new Date(today);
		nextDay.setHours(23, 59, 59, 999);

		const pendingJobQueuesToday = pendingJobs.map((job) =>
			job.jobQueues
				.filter(({ scheduledAt, status }) => {
					const jobDate = new Date(scheduledAt);
					return jobDate < nextDay && status === "pending";
				})
		);

		for (const batch of pendingJobQueuesToday) {
			await queueHandler.processBatch(batch);
		}

		return {
			result: "success",
			jobs: pendingJobQueuesToday,
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
