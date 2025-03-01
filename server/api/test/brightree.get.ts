import { BrightreeScheduling } from '../../utils/providers/brightree'

/**
 * API endpoint to test Brightree connection
 * 
 * This endpoint tests the connection to the Brightree API and returns
 * available appointment slots for the next 7 days.
 * 
 * Usage:
 * GET /api/test/brightree
 * 
 * Query parameters:
 * - days: Number of days to look ahead (default: 7)
 * - mock: Set to 'true' to use mock data (default: false)
 */
export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const days = parseInt(query.days as string || '7')
    const useMock = query.mock === 'true'
    
    // Get runtime config
    const config = useRuntimeConfig()
    const username = config.brightreeUsername
    const password = config.brightreePassword
    
    // Validate credentials
    if (!useMock && (!username || !password)) {
      return {
        success: false,
        message: 'Brightree API credentials not configured',
        error: 'Missing BRIGHTREE_USERNAME or BRIGHTREE_PASSWORD environment variables'
      }
    }
    
    // Calculate date range
    const today = new Date()
    const startDate = new Date(today)
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + days)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    // Initialize Brightree client
    const brightree = new BrightreeScheduling(
      username as string,
      password as string
    )
    
    // Test connection
    let connectionStatus = {
      initialized: false,
      error: null
    }
    
    try {
      await brightree.initClient()
      connectionStatus.initialized = true
    } catch (error: any) {
      connectionStatus.error = error.message || 'Failed to initialize Brightree client'
    }
    
    // Get available appointment slots
    let availableSlots = []
    let slotsError = null
    
    if (connectionStatus.initialized || useMock) {
      try {
        if (useMock) {
          // Generate mock data
          availableSlots = generateMockAppointmentSlots(startDateStr, endDateStr)
        } else {
          availableSlots = await brightree.getAvailableAppointmentSlots(startDateStr, endDateStr)
        }
      } catch (error: any) {
        slotsError = error.message || 'Failed to fetch available appointment slots'
      }
    }
    
    // Return test results
    return {
      success: connectionStatus.initialized || useMock,
      message: connectionStatus.initialized 
        ? 'Brightree API connection successful' 
        : 'Brightree API connection failed',
      connectionStatus,
      dateRange: {
        startDate: startDateStr,
        endDate: endDateStr,
        days
      },
      availableSlots: {
        count: availableSlots.length,
        data: availableSlots,
        error: slotsError
      },
      usedMockData: useMock
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Error testing Brightree API connection',
      error: error.message || 'Unknown error'
    }
  }
})

/**
 * Generate mock appointment slots for testing
 */
function generateMockAppointmentSlots(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)
  const slots = []
  
  // Generate slots for each day in the range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    // Skip weekends
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Generate 3-8 random time slots
      const numSlots = Math.floor(Math.random() * 6) + 3
      const times = []
      
      // Morning slots (9am-12pm)
      for (let i = 9; i <= 11; i++) {
        if (Math.random() > 0.3) { // 70% chance of availability
          times.push(`${i}:00 AM`)
        }
        if (Math.random() > 0.5) { // 50% chance of half-hour slot
          times.push(`${i}:30 AM`)
        }
      }
      
      // Afternoon slots (1pm-5pm)
      for (let i = 1; i <= 4; i++) {
        if (Math.random() > 0.3) { // 70% chance of availability
          times.push(`${i}:00 PM`)
        }
        if (Math.random() > 0.5) { // 50% chance of half-hour slot
          times.push(`${i}:30 PM`)
        }
      }
      
      // Sort times chronologically
      times.sort((a, b) => {
        const aHour = parseInt(a.split(':')[0])
        const bHour = parseInt(b.split(':')[0])
        const aMinute = parseInt(a.split(':')[1].split(' ')[0])
        const bMinute = parseInt(b.split(':')[1].split(' ')[0])
        const aIsPM = a.includes('PM')
        const bIsPM = b.includes('PM')
        
        if (aIsPM && !bIsPM) return 1
        if (!aIsPM && bIsPM) return -1
        if (aHour !== bHour) return aHour - bHour
        return aMinute - bMinute
      })
      
      slots.push({
        date: dateStr,
        availableTimes: times
      })
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
}
