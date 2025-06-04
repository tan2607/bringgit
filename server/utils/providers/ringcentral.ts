import { SDK } from '@ringcentral/sdk'
import { z } from 'zod'

// Define schemas for RingCentral data
export const callRecordingSchema = z.object({
  id: z.string(),
  uri: z.string(),
  contentUri: z.string(),
  duration: z.number(),
  type: z.string(),
  direction: z.string().optional(),
  callId: z.string(),
  callStatus: z.string().optional(),
  startTime: z.string(),
  from: z.object({
    phoneNumber: z.string().optional(),
    name: z.string().optional()
  }).optional(),
  to: z.object({
    phoneNumber: z.string().optional(),
    name: z.string().optional()
  }).optional()
})

export type CallRecording = z.infer<typeof callRecordingSchema>

/**
 * RingCentral API client for retrieving call recordings and other phone-related data
 */
export class RingCentralProvider {
  private clientId: string
  private clientSecret: string
  private serverUrl: string
  private jwt: string
  private sdk: SDK | null = null
  private platform: any = null
  private isAuthenticated: boolean = false

  /**
   * Create a new RingCentral API client
   * @param clientId RingCentral client ID
   * @param clientSecret RingCentral client secret
   * @param serverUrl RingCentral server URL
   * @param jwt RingCentral JWT token
   */
  constructor(
    clientId: string,
    clientSecret: string,
    serverUrl: string,
    jwt: string
  ) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.serverUrl = serverUrl
    this.jwt = jwt
  }

  /**
   * Initialize the RingCentral SDK and authenticate
   * @returns Platform instance
   */
  private async initialize(): Promise<any> {
    if (!this.sdk) {
      this.sdk = new SDK({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        server: this.serverUrl
      })

      this.platform = this.sdk.platform()
    }

    if (!this.isAuthenticated) {
      try {
        // Check if there's an existing token
        const tokenData = this.platform.auth().data()
        
        if (!tokenData || !tokenData.access_token) {
          // No token exists, perform JWT authentication
          await this.platform.login({
            jwt: this.jwt
          })
          console.log('RingCentral: Successfully authenticated with JWT')
        } else {
          // Token exists, check if it's expired or about to expire
          const expiresAt = tokenData.expires_at
          const now = Date.now()
          
          // If token is expired or about to expire in the next 5 minutes, refresh it
          if (!expiresAt || now >= expiresAt - 5 * 60 * 1000) {
            try {
              await this.platform.refresh()
              console.log('RingCentral: Successfully refreshed token')
            } catch (refreshError) {
              console.warn('RingCentral: Failed to refresh token, performing new JWT login')
              await this.platform.login({
                jwt: this.jwt
              })
              console.log('RingCentral: Successfully re-authenticated with JWT')
            }
          }
        }
        
        this.isAuthenticated = true
      } catch (error) {
        console.error('RingCentral authentication error:', error)
        throw new Error('Failed to authenticate with RingCentral')
      }
    }

    return this.platform
  }

  /**
   * Get recent call recordings
   * @param dateFrom Optional start date for filtering (ISO format)
   * @param dateTo Optional end date for filtering (ISO format)
   * @param limit Maximum number of recordings to retrieve
   * @returns Array of call recordings
   */
  async getRecentCallRecordings(
    dateFrom?: string,
    dateTo?: string,
    limit: number = 10
  ): Promise<CallRecording[]> {
    try {
      const platform = await this.initialize()

      // Build query parameters
      const params: any = {
        type: 'Voice',
        view: 'Detailed',
        perPage: limit
      }

      if (dateFrom) {
        params.dateFrom = dateFrom
      }

      if (dateTo) {
        params.dateTo = dateTo
      }

      // Get call log with recordings
      const response = await platform.get('/restapi/v1.0/account/~/call-log', {
        params: {
          ...params,
          withRecording: true
        }
      })

      const data = await response.json()
      
      if (!data || !data.records || !Array.isArray(data.records)) {
        return []
      }

      // Filter to only include calls with recordings
      const callsWithRecordings = data.records.filter((record: any) => 
        record.recording && record.recording.contentUri
      )

      // Transform to our schema format
      return callsWithRecordings.map((record: any) => ({
        id: record.recording.id,
        uri: record.recording.uri,
        contentUri: record.recording.contentUri,
        duration: record.recording.duration || 0,
        type: record.recording.type || 'Voice',
        direction: record.direction,
        callId: record.id,
        callStatus: record.result,
        startTime: record.startTime,
        from: {
          phoneNumber: record.from?.phoneNumber,
          name: record.from?.name
        },
        to: {
          phoneNumber: record.to?.phoneNumber,
          name: record.to?.name
        }
      }))
    } catch (error) {
      console.error('Error fetching call recordings:', error)
      throw error
    }
  }

  /**
   * Get the content of a specific call recording
   * @param recordingId ID of the recording to retrieve
   * @returns Recording content as a binary buffer
   */
  async getCallRecordingContent(recordingId: string): Promise<Buffer> {
    try {
      const platform = await this.initialize()
      
      // Get the recording content
      const response = await platform.get(
        `/restapi/v1.0/account/~/recording/${recordingId}/content`
      )
      
      // Get the binary content
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Error fetching recording content:', error)
      throw error
    }
  }

  /**
   * Get detailed information about a specific call recording
   * @param recordingId ID of the recording to retrieve
   * @returns Call recording details
   */
  async getCallRecordingDetails(recordingId: string): Promise<CallRecording> {
    try {
      const platform = await this.initialize()
      
      // Get the recording metadata
      const response = await platform.get(
        `/restapi/v1.0/account/~/recording/${recordingId}`
      )
      
      const data = await response.json()
      
      // Get the associated call log for additional details
      const callLogResponse = await platform.get(
        `/restapi/v1.0/account/~/call-log/${data.callId || data.id}`
      )
      
      const callData = await callLogResponse.json()
      
      // Combine the data
      return {
        id: data.id,
        uri: data.uri,
        contentUri: data.contentUri,
        duration: data.duration || 0,
        type: data.type || 'Voice',
        direction: callData.direction,
        callId: callData.id,
        callStatus: callData.result,
        startTime: callData.startTime || data.startTime,
        from: {
          phoneNumber: callData.from?.phoneNumber,
          name: callData.from?.name
        },
        to: {
          phoneNumber: callData.to?.phoneNumber,
          name: callData.to?.name
        }
      }
    } catch (error) {
      console.error('Error fetching recording details:', error)
      throw error
    }
  }

  /**
   * Get mock call recordings for testing
   * @param count Number of mock recordings to generate
   * @returns Array of mock call recordings
   */
  getMockCallRecordings(count: number = 5): CallRecording[] {
    const recordings: CallRecording[] = []
    
    for (let i = 0; i < count; i++) {
      const id = `recording-${i + 1}`
      const callId = `call-${i + 1}`
      const isInbound = Math.random() > 0.5
      const duration = Math.floor(Math.random() * 600) + 30 // 30 seconds to 10 minutes
      
      // Generate a random date within the last 7 days
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 7))
      
      recordings.push({
        id,
        uri: `/restapi/v1.0/account/~/recording/${id}`,
        contentUri: `/restapi/v1.0/account/~/recording/${id}/content`,
        duration,
        type: 'Voice',
        direction: isInbound ? 'Inbound' : 'Outbound',
        callId,
        callStatus: 'Completed',
        startTime: date.toISOString(),
        from: {
          phoneNumber: isInbound ? '+15551234567' : '+16505550100',
          name: isInbound ? 'John Doe' : 'Support Agent'
        },
        to: {
          phoneNumber: isInbound ? '+16505550100' : '+15551234567',
          name: isInbound ? 'Support Agent' : 'John Doe'
        }
      })
    }
    
    // Sort by start time (newest first)
    return recordings.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }
}
