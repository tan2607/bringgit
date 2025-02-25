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
			orderBy: [asc(jobQueue.createdAt)],
			limit: 500,
		});

		console.log(`[Schedule] Scheduling ${jobQueues.length} jobs`);

		const batchSize = 100;
		const batches = [];
		for (let i = 0; i < jobQueues.length; i += batchSize) {
			batches.push(jobQueues.slice(i, i + batchSize));
		}

		for (const batch of batches) {
			await $fetch("/api/queue/consumer", {
				method: "POST",
				body: {
					messages: batch,
				},
			});
		}

		return {
			result: "success",
		};
	},
});
