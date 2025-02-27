import { defineEventHandler, readBody } from 'h3'
import { BrightreeScheduling } from '../utils/providers/brightree'

// Get Brightree credentials from environment variables
const username = process.env.BRIGHTREE_USERNAME || ''
const password = process.env.BRIGHTREE_PASSWORD || ''

/**
 * API endpoint to test Brightree API connection
 * 
 * This endpoint tests the connection to the Brightree API and performs
 * basic operations to verify functionality.
 * 
 * Usage:
 * POST /api/test-brightree
 * 
 * Request body:
 * {
 *   "useMock": boolean,  // Optional: Use mock data instead of real API
 *   "testMethod": string // Optional: Specific method to test (default: "WIPStatesFetchAll")
 * }
 */
export default defineEventHandler(async (event) => {
  // Read request body
  const body = await readBody(event)
  const useMock = body.useMock === true
  const testMethod = body.testMethod || 'WIPStatesFetchAll'

  // Create Brightree client
  const brightree = new BrightreeScheduling(username, password)

  // If using mock data, return mock response
  if (useMock) {
    if (testMethod === 'WIPStatesFetchAll') {
      return {
        success: true,
        message: 'Mock Brightree API WIPStatesFetchAll test successful',
        wipStates: brightree.getMockWIPStates(),
        isMock: true
      }
    }
  }

  // If not using mock data, try to connect to Brightree API
  try {
    if (testMethod === 'WIPStatesFetchAll') {
      const wipStates = await brightree.fetchWIPStates()
      
      return {
        success: true,
        message: 'Brightree API WIPStatesFetchAll test successful',
        wipStates
      }
    }
    
    // Default error if no method specified
    return {
      success: false,
      message: 'Invalid test method specified',
      error: `Test method '${testMethod}' not supported`
    }
  } catch (error: any) {
    console.error('Error testing Brightree API:', error)
    
    // Return error response
    return {
      success: false,
      message: 'Failed to initialize Brightree client',
      error: error.message || 'Unknown error'
    }
  }
})
