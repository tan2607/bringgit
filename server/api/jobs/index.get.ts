import { gte } from 'drizzle-orm'
import { jobs, jobQueue } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle()
    const query = getQuery(event)
    // Fetch all job from 1 week from now
    const jobsData = await db.query.jobs.findMany({
      limit: 50,
      orderBy: [desc(jobs.createdAt)],
      offset: query.offset ? parseInt(query.offset as string) : 0
    })
    const total = await db.$count(jobs)
    return {
      jobs: jobsData,
      total
    };
  } catch (error) {
    console.error(error)
    return [];
  }
})
