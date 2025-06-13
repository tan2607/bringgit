import { BrightreeProvider } from '@@/server/utils/providers/brightree'

export default defineEventHandler(async (event) => {
  try {
    // Get environment variables
    const config = useRuntimeConfig()
    
    // Create Brightree provider
    const brightree = BrightreeProvider.getInstance()
    
    // Get mock appointment availability data
    const availabilityData = brightree.getMockAppointmentAvailability()
    
    return {
      success: true,
      data: availabilityData
    }
  } catch (error) {
    console.error('Error fetching appointment availability:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
})
