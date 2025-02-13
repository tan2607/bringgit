import { jobQueue } from "~/server/database/schema";

export default defineTask({
	meta: {
		name: "jobs:schedule",
		description: "Schedule jobs Cronjob",
	},
	run: async ({ payload, context }) => {
		const db = useDrizzle();
		const jobQueues = await db.query.jobQueue.findMany({
			limit: 10,
			where: and(
				eq(jobQueue.status, "pending"),
			),
			orderBy: [desc(jobQueue.createdAt)],
		});

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
