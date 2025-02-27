import { createError } from 'h3'
import { RingCentralProvider } from '../utils/providers/ringcentral'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const dateFrom = query.dateFrom as string
    const dateTo = query.dateTo as string
    const limit = parseInt(query.limit as string || '10')
    const useMock = query.mock === 'true'

    // Get config
    const config = useRuntimeConfig()
    const rcConfig = config.ringcentral

    // Check if RingCentral is configured
    if (!useMock && (!rcConfig.clientId || !rcConfig.clientSecret || !rcConfig.username || !rcConfig.password)) {
      throw createError({
        statusCode: 500,
        message: 'RingCentral API is not properly configured'
      })
    }

    // Initialize RingCentral provider
    const ringcentral = new RingCentralProvider(
      rcConfig.clientId,
      rcConfig.clientSecret,
      rcConfig.serverUrl,
      rcConfig.username,
      rcConfig.extension,
      rcConfig.password
    )

    // Get call recordings
    let recordings
    if (useMock) {
      recordings = ringcentral.getMockCallRecordings(limit)
    } else {
      recordings = await ringcentral.getRecentCallRecordings(dateFrom, dateTo, limit)
    }

    return {
      success: true,
      data: recordings
    }
  } catch (error: any) {
    console.error('Error fetching call recordings:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to fetch call recordings'
    }
  }
})
