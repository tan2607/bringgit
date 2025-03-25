import { createError } from 'h3'
import { RingCentralProvider } from '../../utils/providers/ringcentral'

export default defineEventHandler(async (event) => {
  try {
    // Get recording ID from route params
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Recording ID is required'
      })
    }

    // Get query parameters
    const query = getQuery(event)
    const content = query.content === 'true'
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

    if (useMock) {
      // For mock data, return a mock recording
      const mockRecordings = ringcentral.getMockCallRecordings(5)
      const mockRecording = mockRecordings.find(r => r.id === id) || mockRecordings[0]
      
      if (content) {
        // For mock content, return a simple audio buffer
        // This would normally be an audio file, but for mock purposes we'll just return a placeholder
        setResponseHeader(event, 'Content-Type', 'audio/mpeg')
        setResponseHeader(event, 'Content-Disposition', `attachment; filename="recording-${id}.mp3"`)
        
        // Return a small buffer as mock audio content
        return Buffer.from('Mock audio content for recording ' + id)
      }
      
      return {
        success: true,
        data: mockRecording
      }
    } else {
      if (content) {
        // Get the actual recording content
        const recordingContent = await ringcentral.getCallRecordingContent(id)
        
        // Set appropriate headers for audio download
        setResponseHeader(event, 'Content-Type', 'audio/mpeg')
        setResponseHeader(event, 'Content-Disposition', `attachment; filename="recording-${id}.mp3"`)
        
        return recordingContent
      } else {
        // Get recording details
        const recordingDetails = await ringcentral.getCallRecordingDetails(id)
        
        return {
          success: true,
          data: recordingDetails
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching call recording:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to fetch call recording'
    }
  }
})
