import { jobs, jobQueue } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle()
    // get all jobs include related job_queues
    const jobsData = await db.query.jobs.findMany({
      with: {
        jobQueues: true
      }
    })

    return jobsData;
  } catch (error) {
    console.error(error)
    return [];
  }
})
