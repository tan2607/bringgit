import { createClientAsync } from 'soap'
import { z } from 'zod'

// Schema for WIP state
export const wipStateSchema = z.object({
  BrightreeID: z.number(),
  Description: z.string(),
  IsActive: z.boolean(),
  SortOrder: z.number()
})

export type WIPState = z.infer<typeof wipStateSchema>

// Schema for appointment availability
export const appointmentTimeSchema = z.object({
  time: z.string()
})

export const appointmentDateSchema = z.object({
  date: z.string(),
  availableTimes: z.array(z.string())
})

export type AppointmentDate = z.infer<typeof appointmentDateSchema>

/**
 * Brightree SOAP API client for Reference Data Service operations
 */
export class BrightreeScheduling {
  private username: string
  private password: string
  private referenceDataWsdlUrl: string
  private referenceDataClient: any = null

  /**
   * Create a new Brightree SOAP API client
   * @param username Brightree API username
   * @param password Brightree API password
   * @param referenceDataWsdlUrl Optional Reference Data Service WSDL URL override
   */
  constructor(
    username: string, 
    password: string, 
    referenceDataWsdlUrl?: string
  ) {
    this.username = username
    this.password = password
    this.referenceDataWsdlUrl = referenceDataWsdlUrl || 'https://webservices.brightree.net/v0100-2211/ReferenceDataService/ReferenceDataService.svc?wsdl'
  }

  /**
   * Initialize the Reference Data Service SOAP client
   * @returns Reference Data Service SOAP client instance
   */
  async initClient() {
    if (!this.referenceDataClient) {
      try {
        this.referenceDataClient = await createClientAsync(this.referenceDataWsdlUrl)
        
        // Set security credentials
        this.referenceDataClient.setSecurity(
          new (this.referenceDataClient.BasicAuthSecurity)(this.username, this.password)
        )
      } catch (error) {
        console.error('Error initializing Brightree Reference Data Service client:', error)
        throw new Error('Failed to initialize Brightree SOAP client')
      }
    }
    return this.referenceDataClient
  }

  /**
   * Fetch WIP states from the Reference Data Service
   * @returns Promise with WIP states
   */
  async fetchWIPStates(): Promise<WIPState[]> {
    try {
      const client = await this.initClient()
      
      // Call the WIPStatesFetchAll method
      const result = await client.WIPStatesFetchAllAsync({})
      
      // Process the response
      const response = result[0]
      
      if (!response.WIPStatesFetchAllResult.Success) {
        throw new Error(
          response.WIPStatesFetchAllResult.ErrorMessage || 
          'Failed to fetch WIP states'
        )
      }
      
      // Transform the response into our schema format
      const wipStates: WIPState[] = []
      
      if (response.WIPStatesFetchAllResult.WIPStates?.WIPState) {
        const states = Array.isArray(response.WIPStatesFetchAllResult.WIPStates.WIPState)
          ? response.WIPStatesFetchAllResult.WIPStates.WIPState
          : [response.WIPStatesFetchAllResult.WIPStates.WIPState]
        
        for (const state of states) {
          wipStates.push({
            BrightreeID: state.BrightreeID,
            Description: state.Description,
            IsActive: state.IsActive,
            SortOrder: state.SortOrder
          })
        }
      }
      
      return wipStates
    } catch (error) {
      console.error('Error fetching WIP states:', error)
      throw error
    }
  }

  /**
   * Generate mock WIP states for testing
   * @returns Array of mock WIP states
   */
  getMockWIPStates(): WIPState[] {
    return [
      {
        BrightreeID: 1,
        Description: "New",
        IsActive: true,
        SortOrder: 1
      },
      {
        BrightreeID: 2,
        Description: "In Progress",
        IsActive: true,
        SortOrder: 2
      },
      {
        BrightreeID: 3,
        Description: "On Hold",
        IsActive: true,
        SortOrder: 3
      },
      {
        BrightreeID: 4,
        Description: "Completed",
        IsActive: true,
        SortOrder: 4
      },
      {
        BrightreeID: 5,
        Description: "Cancelled",
        IsActive: true,
        SortOrder: 5
      },
      {
        BrightreeID: 6,
        Description: "Pending Review",
        IsActive: true,
        SortOrder: 6
      },
      {
        BrightreeID: 7,
        Description: "Pending Approval",
        IsActive: true,
        SortOrder: 7
      },
      {
        BrightreeID: 8,
        Description: "Scheduled",
        IsActive: true,
        SortOrder: 8
      }
    ]
  }

  /**
   * Generate mock appointment availability data for testing
   * @param startDate Optional start date in YYYY-MM-DD format
   * @param endDate Optional end date in YYYY-MM-DD format
   * @returns Array of mock appointment dates with 3 random dates within the next 7 days
   */
  getMockAppointmentAvailability(startDate?: string, endDate?: string): AppointmentDate[] {
    const availabilityData: AppointmentDate[] = []
    const today = startDate ? new Date(startDate) : new Date()
    
    // Calculate end date (7 days from start if not provided)
    const endDateTime = endDate ? new Date(endDate) : new Date(today)
    if (!endDate) {
      endDateTime.setDate(today.getDate() + 7)
    }
    
    // Calculate the range in days
    const dayRange = Math.min(
      Math.floor((endDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      7 // Cap at 7 days max
    )
    
    // Format options for date display
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }
    
    // Generate 3 random dates within the date range (no duplicates)
    const selectedDates = new Set<string>()
    while (selectedDates.size < 3) {
      // Random day offset (0 to dayRange days from today)
      const dayOffset = Math.floor(Math.random() * (dayRange + 1))
      const date = new Date(today)
      date.setDate(today.getDate() + dayOffset)
      
      // Format the date as a string (e.g., "Monday, February 26")
      const dateString = date.toLocaleDateString('en-US', dateOptions)
      selectedDates.add(dateString)
    }
    
    // Convert Set to Array and sort chronologically
    const sortedDates = Array.from(selectedDates).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
    
    // For each date, generate multiple time slots
    sortedDates.forEach(dateString => {
      // Generate 3-5 time slots for each date
      const numSlots = 3 + Math.floor(Math.random() * 3) // 3-5 slots
      const availableTimes: string[] = []
      
      // Keep track of used hours to avoid duplicates
      const usedHours = new Set<number>()
      
      // Generate random time slots (no duplicates)
      while (availableTimes.length < numSlots) {
        // Business hours: 9 AM to 5 PM (9-17)
        const startHour = 9 + Math.floor(Math.random() * 8) // Random hour between 9-16
        
        // Skip if this hour is already used
        if (usedHours.has(startHour)) continue
        
        // Mark this hour as used
        usedHours.add(startHour)
        
        // Format the time (e.g. "10:00 AM")
        const timeString = `${startHour > 12 ? startHour - 12 : startHour}:00 ${startHour >= 12 ? 'PM' : 'AM'}`
        availableTimes.push(timeString)
      }
      
      // Sort times chronologically
      availableTimes.sort((a, b) => {
        const hourA = parseInt(a.split(':')[0]) + (a.includes('PM') && !a.startsWith('12') ? 12 : 0)
        const hourB = parseInt(b.split(':')[0]) + (b.includes('PM') && !b.startsWith('12') ? 12 : 0)
        return hourA - hourB
      })
      
      // Add to availability data
      availabilityData.push({
        date: dateString,
        availableTimes
      })
    })
    
    return availabilityData
  }
}
