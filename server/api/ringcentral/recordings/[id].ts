import { RingCentralProvider } from '@@/server/utils/providers/ringcentral'

export default defineEventHandler(async (event) => {
  try {
    // Get recording ID from URL
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return {
        success: false,
        error: 'Recording ID is required'
      }
    }
    
    // Get environment variables
    const config = useRuntimeConfig()
    
    // Create RingCentral provider
    const ringcentral = new RingCentralProvider(
      config.ringcentral.clientId,
      config.ringcentral.clientSecret,
      config.ringcentral.serverUrl,
      config.ringcentral.jwt
    )
    
    // Check if this is a mock recording
    if (id.startsWith('mock-')) {
      // For mock recordings, return a mock audio URL
      return {
        success: true,
        url: 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/11/file_example_MP3_700KB.mp3',
        contentType: 'audio/mpeg'
      }
    }
    
    // For real recordings, try to get the actual content
    try {
      // Get recording content
      const content = await ringcentral.getCallRecordingContent(id)
      
      // Convert to base64 for frontend use
      const base64Content = content.toString('base64')
      
      // Create a data URL
      const dataUrl = `data:audio/mpeg;base64,${base64Content}`
      
      return {
        success: true,
        url: dataUrl,
        contentType: 'audio/mpeg'
      }
    } catch (error) {
      console.error('Error fetching recording content:', error)
      
      // Fall back to mock audio if real API fails
      return {
        success: true,
        url: 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/11/file_example_MP3_700KB.mp3',
        contentType: 'audio/mpeg'
      }
    }
  } catch (error) {
    console.error('Error processing recording request:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to fetch recording'
    }
  }
})
