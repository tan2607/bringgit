import { jobQueue } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
	try {
		const db = useDrizzle();
		const jobQueues = await db.query.jobQueue.findMany({
			limit: 10,
			where: and(eq(jobQueue.status, "pending")),
			orderBy: [desc(jobQueue.createdAt)],
		});
	
		await $fetch("/api/queue/consumer", {
			method: "POST",
			body: {
				messages: jobQueues,
			},
		});
	
		console.log("[Schedule] Job queues scheduled");
	
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
