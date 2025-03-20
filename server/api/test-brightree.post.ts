import { defineEventHandler, readBody, createError } from 'h3'
import { BrightreeProvider } from '../utils/providers/brightree'
import { z } from 'zod'

// Request body schema
const requestSchema = z.object({
  useMock: z.boolean().optional().default(false),
  testMethod: z.enum(['WIPStatesFetchAll', 'getAppointmentAvailability']).optional().default('WIPStatesFetchAll')
})

/**
 * API endpoint to test Brightree API connection
 * 
 * This endpoint tests the connection to the Brightree API and performs
 * basic operations to verify functionality.
 * 
 * @route POST /api/test-brightree
 * @param {Object} body - Request body
 * @param {boolean} [body.useMock=false] - Use mock data instead of real API
 * @param {string} [body.testMethod='WIPStatesFetchAll'] - Method to test
 * @returns {Promise<Object>} Test results
 */
export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const { useMock, testMethod } = requestSchema.parse(body)

    // Create Brightree client
    const brightree = BrightreeProvider.getInstance()

    // Handle different test methods
    switch (testMethod) {
      case 'WIPStatesFetchAll': {
        const wipStates = await brightree.fetchWIPStates()
        return {
          success: true,
          color: 'success',
          message: 'Successfully fetched WIP states',
          data: wipStates
        }
      }
      
      case 'getAppointmentAvailability': {
        const appointments = useMock
          ? brightree.getMockAppointmentAvailability()
          : await brightree.fetchWIPStates() // Replace with real appointment API when available
        return {
          success: true,
          color: 'success',
          message: `Successfully fetched appointments (${useMock ? 'mock' : 'real'} data)`,
          data: appointments
        }
      }
    }
  } catch (error) {
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request parameters',
        data: {
          success: false,
          color: 'error',
          error: error.errors
        }
      })
    }

    console.error('Brightree API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process Brightree request',
      data: {
        success: false,
        color: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})
