/**
 * FHIR Schema Implementation
 * 
 * This file contains type definitions and utilities for working with FHIR resources
 * (Fast Healthcare Interoperability Resources) - the healthcare industry standard
 * for exchanging healthcare information electronically.
 * 
 * @see https://www.hl7.org/fhir/
 */

import { z } from 'zod'

/**
 * Basic FHIR Resource structure
 */
export const FHIRResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string().optional(),
  meta: z.object({
    versionId: z.string().optional(),
    lastUpdated: z.string().optional()
  }).optional()
})

/**
 * Human Name component structure
 */
export const HumanNameSchema = z.object({
  use: z.enum(['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden']).optional(),
  text: z.string().optional(),
  family: z.string().optional(),
  given: z.array(z.string()).optional(),
  prefix: z.array(z.string()).optional(),
  suffix: z.array(z.string()).optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
})

/**
 * Address structure
 */
export const AddressSchema = z.object({
  use: z.enum(['home', 'work', 'temp', 'old', 'billing']).optional(),
  type: z.enum(['postal', 'physical', 'both']).optional(),
  text: z.string().optional(),
  line: z.array(z.string()).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
})

/**
 * ContactPoint (phone, email, etc)
 */
export const ContactPointSchema = z.object({
  system: z.enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other']).optional(),
  value: z.string().optional(),
  use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional(),
  rank: z.number().optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
})

/**
 * Reference to another resource
 */
export const ReferenceSchema = z.object({
  reference: z.string().optional(),
  type: z.string().optional(),
  identifier: z.object({
    system: z.string().optional(),
    value: z.string().optional()
  }).optional(),
  display: z.string().optional()
})

/**
 * CodeableConcept for coded values
 */
export const CodeableConceptSchema = z.object({
  coding: z.array(z.object({
    system: z.string().optional(),
    code: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  text: z.string().optional()
})

/**
 * Identifier structure
 */
export const IdentifierSchema = z.object({
  use: z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
  type: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional()
    })).optional(),
    text: z.string().optional()
  }).optional(),
  system: z.string().optional(),
  value: z.string().optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  assigner: z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  }).optional()
})

/**
 * Patient Resource Schema
 */
export const PatientSchema = FHIRResourceSchema.extend({
  resourceType: z.literal('Patient'),
  identifier: z.array(IdentifierSchema).optional(),
  active: z.boolean().optional(),
  name: z.array(HumanNameSchema).optional(),
  telecom: z.array(ContactPointSchema).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  address: z.array(AddressSchema).optional(),
  maritalStatus: CodeableConceptSchema.optional(),
  contact: z.array(z.object({
    relationship: z.array(CodeableConceptSchema).optional(),
    name: HumanNameSchema.optional(),
    telecom: z.array(ContactPointSchema).optional(),
    address: AddressSchema.optional(),
    gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
    organization: ReferenceSchema.optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })).optional(),
  communication: z.array(z.object({
    language: CodeableConceptSchema,
    preferred: z.boolean().optional()
  })).optional(),
  generalPractitioner: z.array(ReferenceSchema).optional(),
  managingOrganization: ReferenceSchema.optional()
})

/**
 * Practitioner Resource Schema (Doctor)
 */
export const PractitionerSchema = FHIRResourceSchema.extend({
  resourceType: z.literal('Practitioner'),
  identifier: z.array(IdentifierSchema).optional(),
  active: z.boolean().optional(),
  name: z.array(HumanNameSchema).optional(),
  telecom: z.array(ContactPointSchema).optional(),
  address: z.array(AddressSchema).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  qualification: z.array(z.object({
    identifier: z.array(IdentifierSchema).optional(),
    code: CodeableConceptSchema,
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional(),
    issuer: ReferenceSchema.optional()
  })).optional()
})

/**
 * Appointment Resource Schema
 */
export const AppointmentSchema = FHIRResourceSchema.extend({
  resourceType: z.literal('Appointment'),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum([
    'proposed', 'pending', 'booked', 'arrived', 
    'fulfilled', 'cancelled', 'noshow', 'entered-in-error', 'checked-in'
  ]),
  cancelationReason: CodeableConceptSchema.optional(),
  serviceCategory: z.array(CodeableConceptSchema).optional(),
  serviceType: z.array(CodeableConceptSchema).optional(),
  specialty: z.array(CodeableConceptSchema).optional(),
  appointmentType: CodeableConceptSchema.optional(),
  reasonCode: z.array(CodeableConceptSchema).optional(),
  reasonReference: z.array(ReferenceSchema).optional(),
  priority: z.number().optional(),
  description: z.string().optional(),
  start: z.string().optional(), // ISO datetime 
  end: z.string().optional(),   // ISO datetime
  minutesDuration: z.number().optional(),
  slot: z.array(ReferenceSchema).optional(),
  created: z.string().optional(),
  comment: z.string().optional(),
  participant: z.array(z.object({
    type: z.array(CodeableConceptSchema).optional(),
    actor: ReferenceSchema.optional(),
    required: z.enum(['required', 'optional', 'information-only']).optional(),
    status: z.enum(['accepted', 'declined', 'tentative', 'needs-action']),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  }))
})

/**
 * Coverage Resource Schema (Insurance)
 */
export const CoverageSchema = FHIRResourceSchema.extend({
  resourceType: z.literal('Coverage'),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum(['active', 'cancelled', 'draft', 'entered-in-error']),
  type: CodeableConceptSchema.optional(),
  policyHolder: ReferenceSchema.optional(),
  subscriber: ReferenceSchema.optional(),
  subscriberId: z.string().optional(),
  beneficiary: ReferenceSchema,
  dependent: z.string().optional(),
  relationship: CodeableConceptSchema.optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  payor: z.array(ReferenceSchema),
  class: z.array(z.object({
    type: CodeableConceptSchema,
    value: z.string(),
    name: z.string().optional()
  })).optional(),
  order: z.number().optional(),
  network: z.string().optional(),
  costToBeneficiary: z.array(z.object({
    type: CodeableConceptSchema.optional(),
    value: z.object({
      value: z.number(),
      currency: z.string().optional()
    })
  })).optional()
})

/**
 * Condition Resource Schema (Patient Conditions)
 */
export const ConditionSchema = FHIRResourceSchema.extend({
  resourceType: z.literal('Condition'),
  identifier: z.array(IdentifierSchema).optional(),
  clinicalStatus: CodeableConceptSchema.optional(),
  verificationStatus: CodeableConceptSchema.optional(),
  category: z.array(CodeableConceptSchema).optional(),
  severity: CodeableConceptSchema.optional(),
  code: CodeableConceptSchema,
  bodySite: z.array(CodeableConceptSchema).optional(),
  subject: ReferenceSchema,
  encounter: ReferenceSchema.optional(),
  onsetDateTime: z.string().optional(),
  onsetAge: z.object({
    value: z.number(),
    unit: z.string(),
    system: z.string().optional(),
    code: z.string().optional()
  }).optional(),
  onsetPeriod: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  onsetRange: z.object({
    low: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional()
    }).optional(),
    high: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional()
    }).optional()
  }).optional(),
  onsetString: z.string().optional(),
  abatementDateTime: z.string().optional(),
  abatementAge: z.object({
    value: z.number(),
    unit: z.string(),
    system: z.string().optional(),
    code: z.string().optional()
  }).optional(),
  abatementPeriod: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  abatementRange: z.object({
    low: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional()
    }).optional(),
    high: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional()
    }).optional()
  }).optional(),
  abatementString: z.string().optional(),
  recordedDate: z.string().optional(),
  recorder: ReferenceSchema.optional(),
  asserter: ReferenceSchema.optional(),
  note: z.array(z.object({
    authorString: z.string().optional(),
    time: z.string().optional(),
    text: z.string()
  })).optional()
})

/**
 * Bundle Resource Schema (Collection of resources)
 */
export const BundleSchema = FHIRResourceSchema.extend({
  resourceType: z.literal('Bundle'),
  type: z.enum([
    'document', 'message', 'transaction', 'transaction-response',
    'batch', 'batch-response', 'history', 'searchset', 'collection'
  ]),
  total: z.number().optional(),
  link: z.array(z.object({
    relation: z.string(),
    url: z.string()
  })).optional(),
  entry: z.array(z.object({
    fullUrl: z.string().optional(),
    resource: z.any(), // can be any resource
    search: z.object({
      mode: z.enum(['match', 'include', 'outcome']).optional(),
      score: z.number().optional()
    }).optional(),
    request: z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      url: z.string(),
      ifNoneMatch: z.string().optional(),
      ifModifiedSince: z.string().optional(),
      ifMatch: z.string().optional(),
      ifNoneExist: z.string().optional()
    }).optional(),
    response: z.object({
      status: z.string(),
      location: z.string().optional(),
      etag: z.string().optional(),
      lastModified: z.string().optional(),
      outcome: z.any().optional()
    }).optional()
  })).optional()
})

/**
 * Export FHIR resource types
 */
export const FHIRResources = {
  Patient: PatientSchema,
  Practitioner: PractitionerSchema,
  Appointment: AppointmentSchema,
  Coverage: CoverageSchema,
  Condition: ConditionSchema,
  Bundle: BundleSchema
}

/**
 * Type definitions for TypeScript
 */
export type Patient = z.infer<typeof PatientSchema>
export type Practitioner = z.infer<typeof PractitionerSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type Coverage = z.infer<typeof CoverageSchema>
export type Condition = z.infer<typeof ConditionSchema>
export type Bundle = z.infer<typeof BundleSchema>

/**
 * Type for any FHIR resource
 */
export type FHIRResource = 
  | Patient
  | Practitioner
  | Appointment
  | Coverage
  | Condition
  | Bundle
