import { findNearestClinics } from '@@/server/utils/location'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const searchQuery = query.searchQuery as string
    const limit = query.limit ? parseInt(query.limit as string) : 3

    if (!searchQuery) {
      throw createError({
        statusCode: 400,
        message: 'Search query is required'
      })
    }

    const nearestClinics = await findNearestClinics(searchQuery, limit)
    
    return {
      success: true,
      data: nearestClinics
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
