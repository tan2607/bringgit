/**
 * Medplum FHIR Client Configuration
 * 
 * This file configures the Medplum FHIR client for use in the application.
 * Medplum provides utilities for working with FHIR resources, validation,
 * and interoperability.
 */

import { MedplumClient } from '@medplum/core'

// Create a singleton Medplum client
// We're creating this as a standalone client rather than connecting to a Medplum server
// This gives us access to FHIR utilities without requiring an external service
let medplumClient: MedplumClient | null = null

/**
 * Get the Medplum client instance
 * Creates a new client if one doesn't exist yet
 */
export function getMedplumClient(): MedplumClient {
  if (!medplumClient) {
    medplumClient = new MedplumClient({
      // We're using Medplum in standalone mode for FHIR utilities
      // No baseUrl is required as we're not connecting to a server
    })
  }
  return medplumClient
}

/**
 * Validate a FHIR resource
 * 
 * @param resource FHIR resource to validate
 * @returns Object with validation result and any errors
 */
export function validateFhirResource(resource: any): { valid: boolean; errors?: string[] } {
  try {
    // The validateResource method is available in MedplumClient
    // This performs basic structural validation of FHIR resources
    const client = getMedplumClient()
    
    // Basic validation checks
    if (!resource) {
      return { valid: false, errors: ['Resource is null or undefined'] }
    }
    
    if (!resource.resourceType) {
      return { valid: false, errors: ['Resource is missing resourceType'] }
    }
    
    // Specific resource type validations
    const errors: string[] = []
    
    switch (resource.resourceType) {
      case 'Patient':
        if (resource.name && Array.isArray(resource.name)) {
          // Valid
        } else if (resource.name) {
          errors.push('Patient.name must be an array')
        }
        break
        
      case 'Practitioner':
        if (resource.name && Array.isArray(resource.name)) {
          // Valid
        } else if (resource.name) {
          errors.push('Practitioner.name must be an array')
        }
        break
        
      case 'Bundle':
        if (!resource.type) {
          errors.push('Bundle.type is required')
        }
        if (!resource.entry || !Array.isArray(resource.entry)) {
          errors.push('Bundle.entry must be an array')
        }
        break
    }
    
    return { 
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    return { 
      valid: false, 
      errors: [(error as Error).message || 'Unknown validation error'] 
    }
  }
}
