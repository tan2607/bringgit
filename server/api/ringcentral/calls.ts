import { RingCentralProvider } from '~/server/utils/providers/ringcentral'

export default defineEventHandler(async (event) => {
  try {
    // Get environment variables
    const config = useRuntimeConfig()
    
    // Create RingCentral provider
    const ringcentral = new RingCentralProvider(
      config.ringcentral.clientId,
      config.ringcentral.clientSecret,
      config.ringcentral.serverUrl,
      config.ringcentral.jwt
    )
    
    // Get recent calls (use mock data for demo)
    let calls = []
    
    try {
      // Try to get real data first
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - 30) // Last 30 days
      
      calls = await ringcentral.getRecentCallRecordings(
        dateFrom.toISOString(),
        undefined,
        50
      )
    } catch (error) {
      console.log('Using mock data instead of real RingCentral data')
      // Fall back to mock data if real API fails
      calls = ringcentral.getMockCallRecordings(10)
    }
    
    // Add more mock calls to demonstrate different call statuses
    const mockCalls = [
      {
        id: 'mock-missed-1',
        uri: '/restapi/v1.0/account/~/recording/mock-missed-1',
        contentUri: '/restapi/v1.0/account/~/recording/mock-missed-1/content',
        duration: 0,
        type: 'Voice',
        direction: 'Inbound',
        callId: 'call-missed-1',
        callStatus: 'Missed',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        from: {
          phoneNumber: '+15551234567',
          name: 'John Doe'
        },
        to: {
          phoneNumber: '+16505550100',
          name: 'Support Agent'
        }
      },
      {
        id: 'mock-voicemail-1',
        uri: '/restapi/v1.0/account/~/recording/mock-voicemail-1',
        contentUri: '/restapi/v1.0/account/~/recording/mock-voicemail-1/content',
        duration: 45,
        type: 'Voice',
        direction: 'Inbound',
        callId: 'call-voicemail-1',
        callStatus: 'Voicemail',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        from: {
          phoneNumber: '+15559876543',
          name: 'Jane Smith'
        },
        to: {
          phoneNumber: '+16505550100',
          name: 'Support Agent'
        }
      }
    ]
    
    // Combine real/mock calls with additional mock calls
    const allCalls = [...calls, ...mockCalls]
    
    // Sort by start time (newest first)
    allCalls.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    
    return {
      success: true,
      calls: allCalls
    }
  } catch (error) {
    console.error('Error fetching RingCentral calls:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to fetch call data'
    }
  }
})
