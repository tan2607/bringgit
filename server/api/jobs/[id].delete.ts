import { jobQueue, jobs } from "@@/server/database/schema";

export default defineEventHandler(async (event) => {
	try {
		const jobId = getRouterParam(event, "id");
		const db = useDrizzle();
		// Delete the job from the database and the job_queue related to it
		const targetJob = await db.query.jobs.findFirst({
			where: eq(jobs.id, jobId as string),
		});
		if (!targetJob) {
			return { success: false, message: "Job not found" };
		}
		await db.delete(jobQueue).where(eq(jobQueue.jobId, jobId as string));
		await db.delete(jobs).where(eq(jobs.id, jobId as string));
		return { success: true, message: "Job deleted successfully" };
	} catch (error) {
		console.error(error);
		return { success: false, message: "Error deleting job" };
	}
});
