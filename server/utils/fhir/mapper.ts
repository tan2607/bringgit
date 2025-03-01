/**
 * FHIR Resource Mapper
 * 
 * This utility provides functions to convert between application-specific data structures
 * and standard FHIR resources, ensuring healthcare data interoperability.
 */

import type { 
  Patient, 
  Practitioner, 
  Appointment, 
  Coverage, 
  Condition,
  Bundle
} from './schema'
import { defaultCallVariables } from '../variableSchema'

/**
 * Convert application call variables to a FHIR Bundle
 * 
 * @param callVariables Application-specific call variables
 * @returns FHIR Bundle with Patient, Practitioner, Appointment, Coverage, and Condition resources
 */
export function callVariablesToFHIR(callVariables: typeof defaultCallVariables): Bundle {
  // Generate unique IDs for resources
  const patientId = `patient-${Date.now()}`
  const practitionerId = `practitioner-${Date.now()}`
  const appointmentId = `appointment-${Date.now()}`
  const coverageId = `coverage-${Date.now()}`
  const conditionId = `condition-${Date.now()}`
  
  // Create FHIR Patient resource
  const patient: Patient = {
    resourceType: 'Patient',
    id: patientId,
    identifier: [
      {
        system: 'urn:vitalus:patients',
        value: patientId
      }
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: callVariables.patient.name
      }
    ],
    address: [
      {
        use: 'home',
        text: callVariables.patient.address
      }
    ]
  }
  
  // Create FHIR Practitioner resource (doctor)
  const practitioner: Practitioner = {
    resourceType: 'Practitioner',
    id: practitionerId,
    identifier: [
      {
        system: 'urn:vitalus:practitioners',
        value: practitionerId
      }
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: callVariables.doctor.name,
        prefix: callVariables.doctor.name.includes('Dr.') ? ['Dr.'] : undefined
      }
    ]
  }
  
  // Parse appointment date and time
  let appointmentDateTime: string | undefined
  try {
    // Attempt to create an ISO string from the date and time
    // This is a very basic implementation - would need to be improved for production
    const dateStr = callVariables.appointment.date // e.g., "December 16th"
    const timeStr = callVariables.appointment.morningSlot // e.g., "9am"
    
    // A proper implementation would use a date parsing library
    // For now, we'll just create a placeholder ISO string
    appointmentDateTime = new Date().toISOString()
  } catch (e) {
    console.warn('Could not parse appointment date/time', e)
  }
  
  // Create FHIR Appointment resource
  const appointment: Appointment = {
    resourceType: 'Appointment',
    id: appointmentId,
    status: 'proposed',
    description: `Sleep test appointment for ${callVariables.patient.name}`,
    start: appointmentDateTime,
    participant: [
      {
        actor: {
          reference: `Patient/${patientId}`,
          display: callVariables.patient.name
        },
        status: 'needs-action'
      },
      {
        actor: {
          reference: `Practitioner/${practitionerId}`,
          display: callVariables.doctor.name
        },
        status: 'accepted'
      }
    ]
  }
  
  // Create FHIR Coverage resource (insurance)
  const coverage: Coverage = {
    resourceType: 'Coverage',
    id: coverageId,
    status: 'active',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'EHCPOL',
          display: 'extended healthcare'
        }
      ],
      text: 'Health Insurance'
    },
    beneficiary: {
      reference: `Patient/${patientId}`,
      display: callVariables.patient.name
    },
    payor: [
      {
        display: callVariables.payment.insuranceName
      }
    ],
    costToBeneficiary: [
      {
        type: {
          text: 'Insurance Coverage'
        },
        value: {
          value: parseInt(callVariables.payment.insuranceCoverage.replace('%', '')) || 80,
          currency: '%'
        }
      }
    ]
  }
  
  // Create FHIR Condition resource
  const condition: Condition = {
    resourceType: 'Condition',
    id: conditionId,
    subject: {
      reference: `Patient/${patientId}`,
      display: callVariables.patient.name
    },
    code: {
      text: callVariables.patient.condition
    },
    note: [
      {
        text: `Last visited for this condition ${callVariables.patient.lastVisit}`
      }
    ]
  }
  
  // Bundle all resources together
  const bundle: Bundle = {
    resourceType: 'Bundle',
    id: `bundle-${Date.now()}`,
    type: 'collection',
    entry: [
      {
        fullUrl: `urn:uuid:${patientId}`,
        resource: patient
      },
      {
        fullUrl: `urn:uuid:${practitionerId}`,
        resource: practitioner
      },
      {
        fullUrl: `urn:uuid:${appointmentId}`,
        resource: appointment
      },
      {
        fullUrl: `urn:uuid:${coverageId}`,
        resource: coverage
      },
      {
        fullUrl: `urn:uuid:${conditionId}`,
        resource: condition
      }
    ]
  }
  
  return bundle
}

/**
 * Convert FHIR Bundle to application call variables
 * 
 * @param bundle FHIR Bundle with healthcare resources
 * @returns Application-specific call variables
 */
export function fhirToCallVariables(bundle: Bundle): typeof defaultCallVariables {
  // Create a copy of the default variables
  const variables = JSON.parse(JSON.stringify(defaultCallVariables))
  
  // Process each resource in the bundle
  if (bundle.entry) {
    for (const entry of bundle.entry) {
      const resource = entry.resource
      
      // Handle Patient resource
      if (resource.resourceType === 'Patient') {
        const patient = resource as Patient
        
        // Extract patient name
        if (patient.name && patient.name.length > 0) {
          variables.patient.name = patient.name[0].text || 
            (patient.name[0].given && patient.name[0].family ? 
              `${patient.name[0].given.join(' ')} ${patient.name[0].family}` : 
              variables.patient.name)
        }
        
        // Extract patient address
        if (patient.address && patient.address.length > 0) {
          variables.patient.address = patient.address[0].text || 
            (patient.address[0].line ? 
              patient.address[0].line.join(', ') : 
              variables.patient.address)
        }
      }
      
      // Handle Practitioner resource (doctor)
      else if (resource.resourceType === 'Practitioner') {
        const practitioner = resource as Practitioner
        
        // Extract doctor name
        if (practitioner.name && practitioner.name.length > 0) {
          variables.doctor.name = practitioner.name[0].text || 
            (practitioner.name[0].prefix && practitioner.name[0].given && practitioner.name[0].family ? 
              `${practitioner.name[0].prefix.join(' ')} ${practitioner.name[0].given.join(' ')} ${practitioner.name[0].family}` : 
              variables.doctor.name)
        }
      }
      
      // Handle Appointment resource
      else if (resource.resourceType === 'Appointment') {
        const appointment = resource as Appointment
        
        // Extract appointment description/date
        if (appointment.start) {
          try {
            const date = new Date(appointment.start)
            // Format date as month and day with ordinal suffix
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December']
            const day = date.getDate()
            const month = months[date.getMonth()]
            const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10]
            
            variables.appointment.date = `${month} ${day}${suffix}`
            
            // Format time as morning or afternoon slot
            const hours = date.getHours()
            const minutes = date.getMinutes()
            const isPM = hours >= 12
            const formattedHours = hours % 12 || 12
            const formattedMinutes = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`
            const timeStr = `${formattedHours}${formattedMinutes}${isPM ? 'pm' : 'am'}`
            
            if (isPM) {
              variables.appointment.afternoonSlot = timeStr
            } else {
              variables.appointment.morningSlot = timeStr
            }
          } catch (e) {
            console.warn('Error parsing appointment date', e)
          }
        }
      }
      
      // Handle Coverage resource (insurance)
      else if (resource.resourceType === 'Coverage') {
        const coverage = resource as Coverage
        
        // Extract insurance name
        if (coverage.payor && coverage.payor.length > 0) {
          variables.payment.insuranceName = coverage.payor[0].display || variables.payment.insuranceName
        }
        
        // Extract coverage percentage
        if (coverage.costToBeneficiary && coverage.costToBeneficiary.length > 0) {
          const cost = coverage.costToBeneficiary[0]
          if (cost.value && typeof cost.value.value === 'number') {
            variables.payment.insuranceCoverage = `${cost.value.value}%`
          }
        }
      }
      
      // Handle Condition resource
      else if (resource.resourceType === 'Condition') {
        const condition = resource as Condition
        
        // Extract condition description
        if (condition.code && condition.code.text) {
          variables.patient.condition = condition.code.text
        }
        
        // Extract last visit information
        if (condition.note && condition.note.length > 0) {
          const note = condition.note[0].text
          if (note.includes('Last visited')) {
            const match = note.match(/Last visited for this condition (.+)/)
            if (match && match[1]) {
              variables.patient.lastVisit = match[1]
            }
          }
        }
      }
    }
  }
  
  return variables
}

/**
 * Extract FHIR resources from OCR text
 * 
 * This is a helper function for the Gemini OCR processor to extract structured
 * FHIR data from unstructured text.
 * 
 * @param extractedText Text extracted from document via OCR
 * @returns FHIR Bundle with extracted resources
 */
export function extractFHIRFromText(extractedText: any): Bundle {
  // If we already have a FHIR Bundle, return it
  if (extractedText.resourceType === 'Bundle') {
    return extractedText as Bundle
  }
  
  // Otherwise, convert application data to FHIR
  // First, ensure we have the right structure
  const callVariables = {
    patient: {
      name: extractedText.patient?.name || '',
      condition: extractedText.patient?.condition || '',
      address: extractedText.patient?.address || '',
      lastVisit: extractedText.patient?.lastVisit || ''
    },
    doctor: {
      name: extractedText.doctor?.name || ''
    },
    appointment: {
      date: extractedText.appointment?.date || '',
      morningSlot: extractedText.appointment?.morningSlot || '',
      afternoonSlot: extractedText.appointment?.afternoonSlot || ''
    },
    payment: {
      insuranceName: extractedText.payment?.insuranceName || '',
      insuranceCoverage: extractedText.payment?.insuranceCoverage || '',
      insurancePrice: extractedText.payment?.insurancePrice || '',
      cashPrice: extractedText.payment?.cashPrice || '',
      minDownPayment: extractedText.payment?.minDownPayment || '',
      remainingAmount: extractedText.payment?.remainingAmount || '',
      secondInstallment: extractedText.payment?.secondInstallment || '',
      cancellationFee: extractedText.payment?.cancellationFee || '',
      acceptedMethods: extractedText.payment?.acceptedMethods || '',
      maxInstallments: extractedText.payment?.maxInstallments || ''
    },
    business: { ...defaultCallVariables.business },
    test: { ...defaultCallVariables.test },
    agent: { ...defaultCallVariables.agent },
    coach: { ...defaultCallVariables.coach },
    sleepCoach: { ...defaultCallVariables.sleepCoach }
  }
  
  return callVariablesToFHIR(callVariables)
}

/**
 * Create a FHIR extraction prompt for OCR
 * 
 * @returns Prompt text for extracting FHIR data from documents
 */
export function createFHIRExtractionPrompt(): string {
  return `Please analyze these documents and extract healthcare information in FHIR format. 
  
I need you to identify patient details, healthcare providers, medical conditions, insurance information, 
and appointment details if present. Format your response as a FHIR Bundle containing Patient, Practitioner, 
Condition, Coverage, and Appointment resources as applicable.

Only include fields that you can confidently extract from the documents. If information is not available, 
omit that field rather than guessing.

Example FHIR Bundle structure:
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "name": [{ "text": "Patient Name" }],
        "address": [{ "text": "Patient Address" }]
      }
    },
    {
      "resource": {
        "resourceType": "Practitioner",
        "name": [{ "text": "Doctor Name" }]
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "subject": { "display": "Patient Name" },
        "code": { "text": "Medical Condition" }
      }
    },
    {
      "resource": {
        "resourceType": "Coverage",
        "beneficiary": { "display": "Patient Name" },
        "payor": [{ "display": "Insurance Provider" }]
      }
    },
    {
      "resource": {
        "resourceType": "Appointment",
        "status": "proposed",
        "start": "ISO DateTime",
        "participant": [
          { "actor": { "display": "Patient Name" }, "status": "needs-action" },
          { "actor": { "display": "Doctor Name" }, "status": "accepted" }
        ]
      }
    }
  ]
}

Return the most complete FHIR Bundle you can extract from these documents.`
}

/**
 * Define the Patient schema in Google Gemini format
 * 
 * @returns Patient schema for Gemini extraction
 */
export function defineFHIRPatientSchema() {
  return {
    description: "FHIR Bundle for healthcare data",
    type: "OBJECT",
    properties: {
      resourceType: {
        type: "STRING",
        description: "Resource type - must be 'Bundle'",
      },
      type: {
        type: "STRING",
        description: "Bundle type - should be 'collection'",
      },
      entry: {
        type: "ARRAY",
        description: "Array of resources in the Bundle",
        items: {
          type: "OBJECT",
          properties: {
            resource: {
              type: "OBJECT",
              description: "A FHIR resource such as Patient, Practitioner, etc.",
              properties: {
                resourceType: {
                  type: "STRING",
                  description: "Type of resource - Patient, Practitioner, Condition, Coverage, Appointment, etc.",
                },
              },
            },
          },
        },
      },
    },
  }
}
