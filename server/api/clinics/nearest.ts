import { findNearestClinics } from '~/server/utils/location'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const postalCode = query.postalCode as string
    const limit = query.limit ? parseInt(query.limit as string) : 3

    if (!postalCode) {
      throw createError({
        statusCode: 400,
        message: 'Postal code is required'
      })
    }

    // Validate Singapore postal code format (6 digits)
    if (!/^\d{6}$/.test(postalCode)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid Singapore postal code format'
      })
    }

    const nearestClinics = await findNearestClinics(postalCode, limit)
    
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
