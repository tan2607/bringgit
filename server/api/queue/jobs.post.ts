import { jobs } from "@@/server/database/schema";
import { CallQueueHandler, CallMessage } from "../../utils/queue";

export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();
		const body = await readBody(event);
		const db = useDrizzle();
		const {
			jobId,
			phoneNumbers,
			names,
			assistantId,
			phoneNumberId,
			scheduledAt,
			selectedTimeWindow,
		} = body;

		if (!jobId || !phoneNumbers || !assistantId || !phoneNumberId) {
			throw new Error("Missing required fields");
		}

		const queueHandler = new CallQueueHandler(config.vapiApiKey, event.context.cloudflare.queue);

		// Create messages for each phone number
		const messages = phoneNumbers.map((phoneNumber, index) => ({
			jobId,
			phoneNumber,
			name: names?.[index],
			assistantId,
			phoneNumberId: "",
			retryCount: 0,
			scheduledAt,
			selectedTimeWindow,
			phoneNumbers: phoneNumberId
		}));

		await processMessages(queueHandler, messages);

		// Update job status to running if scheduled time has passed
		if (scheduledAt && new Date(scheduledAt).getTime() < Date.now()) {
			await db.update(jobs).set({ status: "running" }).where(eq(jobs.id, jobId));
		}

		return {
			success: true,
			message: `Enqueued ${phoneNumbers.length} calls for job ${jobId}`,
		};
	} catch (error) {
		console.error("Error queueing job:", error);
		return {
			success: false,
			error: error.message,
		};
	}
});

async function processMessages(queueHandler, messages, batchSize = 100) {
	if (messages.length <= batchSize) {
		await queueHandler.enqueueJobBatch(messages);
		return;
	}

	const batches = [];
	for (let i = 0; i < messages.length; i += batchSize) {
		batches.push(messages.slice(i, i + batchSize));
	}

	await Promise.all(batches.map((batch) => queueHandler.enqueueJobBatch(batch)));
}
