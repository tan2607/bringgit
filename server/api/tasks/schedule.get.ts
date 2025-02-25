import { gte, lt } from "drizzle-orm";
import { jobQueue } from "~/server/database/schema";
import { CallQueueHandler } from "~/server/utils/queue";

export default defineEventHandler(async (event) => {
	try {
		console.log("[Schedule] Job queues scheduled");
		const db = useDrizzle();
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to start of the day

		const jobQueues = await db.query.jobQueue.findMany({
			where: and(
				eq(jobQueue.status, "pending"),
				gte(jobQueue.scheduledAt, today.toISOString()),
				lt(jobQueue.scheduledAt, new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()), // Less than start of next day
			),
			orderBy: [asc(jobQueue.createdAt)],
		});

		const config = useRuntimeConfig();
		const queueHandler = new CallQueueHandler(config.vapiApiKey, event.context.cloudflare.queue);

		const batchSize = 100;
		const batches = [];
		for (let i = 0; i < jobQueues.length; i += batchSize) {
			batches.push(jobQueues.slice(i, i + batchSize));
		}

		for (const batch of batches) {
			await queueHandler.processBatch(batch);
		}
		return {
			result: "success",
			jobs: jobQueues,
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
