import { jobs } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const jobId = getRouterParam(event, "id");
    const { status} = body
    const db = useDrizzle();
    const targetJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId as string),
    });


    if (!targetJob) {
      return { success: false, message: "Job not found" };
    }
    await db.update(jobs).set({
      status: status,
    }).where(eq(jobs.id, jobId as string));
    return { success: true };
  } catch (error) {
    console.error("Error pausing job:", error);
    return { success: false, error: "Failed to pause job" };
  }
});
