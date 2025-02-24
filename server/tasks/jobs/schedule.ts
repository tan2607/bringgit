import { gte, lt } from 'drizzle-orm';
import { jobQueue } from "~/server/database/schema";

export default defineTask({
	meta: {
		name: "jobs:schedule",
		description: "Schedule jobs Cronjob",
	},
	run: async ({ payload, context }) => {
		const db = useDrizzle();
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to start of the day

		const jobQueues = await db.query.jobQueue.findMany({
			where: and(
				eq(jobQueue.status, "pending"),
				gte(jobQueue.scheduledAt, today.toISOString()),
				lt(jobQueue.scheduledAt, new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()) // Less than start of next day
			),
			orderBy: [desc(jobQueue.createdAt)],
		});

		console.log(`[Schedule] Scheduling ${jobQueues.length} jobs`);

		await $fetch("/api/queue/consumer", {
			method: "POST",
			body: {
				messages: jobQueues,
			},
		});

		return {
			result: "success",
		};
	},
});
