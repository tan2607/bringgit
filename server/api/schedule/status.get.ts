import { scheduledCalls } from '../../database/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = useDb()

  try {
    // Get query parameters for filtering
    const query = getQuery(event)
    const { status, limit = '100' } = query

    // Build query
    let baseQuery = db.select().from(scheduledCalls).orderBy(desc(scheduledCalls.scheduledTime))

    // Add status filter if provided
    if (status) {
      baseQuery = baseQuery.where(eq(scheduledCalls.status, status as string))
    }

    // Add limit
    baseQuery = baseQuery.limit(parseInt(limit as string))

    // Execute query
    const jobs = await baseQuery

    return {
      success: true,
      jobs
    }
  } catch (error: any) {
    console.error('Error fetching schedule status:', error)
    return {
      success: false,
      message: error.message || 'Failed to fetch schedule status'
    }
  }
})
