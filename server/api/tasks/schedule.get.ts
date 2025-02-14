import { jobQueue } from "~/server/database/schema";
import { CallQueueHandler } from "~/server/utils/queue";

export default defineEventHandler(async (event) => {
	try {
		console.log("[Schedule] Job queues scheduled");
		const db = useDrizzle();
		const jobQueues = await db.query.jobQueue.findMany({
			limit: 10,
			where: and(eq(jobQueue.status, "pending")),
			orderBy: [desc(jobQueue.createdAt)],
		});
	
		const config = useRuntimeConfig()
		const queueHandler = new CallQueueHandler(
			config.vapiApiKey,
			event.context.cloudflare.queue
		)

		await queueHandler.processBatch(jobQueues);
		return {
			result: "success",
		};
	} catch (error) {
		console.error("[Schedule] Error scheduling job queues", error);
		return {
			result: "error",
			error: error,
		};
	}
});
