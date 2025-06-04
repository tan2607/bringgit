import { jobQueue } from "@@/server/database/schema"

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const jobId = query.jobId
    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required'
      })
    }

    const db = useDrizzle()
    const jobQueues = await db.query.jobQueue.findMany({ where: eq(jobQueue.jobId, jobId) })
    return jobQueues
  } catch (error) {
    console.error(error)
  }
})
