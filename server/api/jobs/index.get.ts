import { jobs } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle()
    const jobsData = await db.select().from(jobs).all();
    return jobsData;
  } catch (error) {
    console.error(error)
    return [];
  }
})
