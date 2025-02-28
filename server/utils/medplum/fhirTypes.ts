/**
 * FHIR Type Definitions
 * 
 * This file re-exports FHIR types from Medplum for use in the application.
 * These types are comprehensive and follow the FHIR R4 specification.
 */

import type {
  Resource,
  DomainResource,
  Patient,
  Practitioner,
  Appointment,
  Coverage,
  Condition,
  Bundle,
  Reference,
  HumanName,
  Address,
  ContactPoint,
  CodeableConcept,
  Coding,
  Identifier
} from '@medplum/core'

// Re-export all types for convenience
export type {
  Resource,
  DomainResource,
  Patient,
  Practitioner,
  Appointment, 
  Coverage,
  Condition,
  Bundle,
  Reference,
  HumanName,
  Address,
  ContactPoint,
  CodeableConcept,
  Coding,
  Identifier
}

/**
 * Helper type for extracting a resource from a bundle
 */
export type ExtractResource<T extends Resource['resourceType']> = Extract<Resource, { resourceType: T }>

/**
 * Helper utility to create an empty FHIR Bundle
 */
export function createEmptyBundle(): Bundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: []
  }
}

/**
 * Helper utility to create a FHIR Reference
 */
export function createReference(resourceType: string, id: string, display?: string): Reference {
  return {
    reference: `${resourceType}/${id}`,
    display
  }
}

/**
 * Helper utility to create a FHIR Identifier
 */
export function createIdentifier(system: string, value: string): Identifier {
  return {
    system,
    value
  }
}

/**
 * Helper utility to create a FHIR HumanName
 */
export function createHumanName(text: string, use: 'official' | 'usual' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden' = 'official'): HumanName {
  // Try to parse the text into components
  const parts = text.trim().split(' ')
  
  if (parts.length === 1) {
    return {
      use,
      text
    }
  }
  
  const family = parts.pop() || ''
  const given = parts
  
  return {
    use,
    text,
    family,
    given
  }
}

/**
 * Helper utility to create a FHIR CodeableConcept
 */
export function createCodeableConcept(text: string, coding?: Coding[]): CodeableConcept {
  return {
    text,
    coding
  }
}
