import { jobs } from "~/server/database/schema";
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
		const messages: CallMessage[] = phoneNumbers.map((phoneNumber, index) => ({
			jobId,
			phoneNumber,
			name: names?.[index],
			assistantId,
			phoneNumberId,
			retryCount: 0,
			scheduledAt,
			selectedTimeWindow,
		}));

		if (messages.length > 100) {
			const patches = messages.reduce((acc, message, index) => {
				const patchIndex = Math.floor(index / 100);
				if (!acc[patchIndex]) {
					acc[patchIndex] = [];
				}
				acc[patchIndex].push(message);
				return acc;
			}, []);

			for (const patch of patches) {
				await queueHandler.enqueueJobBatch(patch);
			}
		} else {
			await queueHandler.enqueueJobBatch(messages);
		}

		// Update job status to running
		const shouldRun = scheduledAt && new Date(scheduledAt).getTime() < Date.now();
		if (shouldRun) {
			await db.update(jobs).set({ status: "running" }).where(eq(jobs.id, jobId));
		}

		return {
			success: true,
			message: `Enqueued ${phoneNumbers.length} calls for job ${jobId}`,
		};
	} catch (error: any) {
		console.error("Error queueing job:", error);
		return {
			success: false,
			error: error.message,
		};
	}
});


async function processMessages(messages, batchSize = 100) {
	// Early return for small batches
	if (messages.length <= batchSize) {
			await queueHandler.enqueueJobBatch(messages);
			return;
	}

	// Process in chunks without creating intermediate arrays
	for (let i = 0; i < messages.length; i += batchSize) {
			const batch = messages.slice(i, i + batchSize);
			await queueHandler.enqueueJobBatch(batch);
	}
}