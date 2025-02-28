/**
 * Variable Schema
 * Single source of truth for all variable definitions used in the webcall system
 */

import { z } from 'zod'

/**
 * Zod schema for call variables
 */
export const callVariableSchema = z.object({
  patient: z.object({
    name: z.string().optional(),
    condition: z.string().optional(),
    address: z.string().optional(),
    lastVisit: z.string().optional(),
  }).optional(),
  doctor: z.object({
    name: z.string().optional(),
  }).optional(),
  appointment: z.object({
    date: z.string().optional(),
    morningSlot: z.string().optional(), 
    afternoonSlot: z.string().optional(),
  }).optional(),
  payment: z.object({
    insuranceName: z.string().optional(),
    insuranceCoverage: z.string().optional(),
    insurancePrice: z.string().optional(),
    cashPrice: z.string().optional(),
    minDownPayment: z.string().optional(),
    remainingAmount: z.string().optional(),
    secondInstallment: z.string().optional(),
    cancellationFee: z.string().optional(),
    acceptedMethods: z.string().optional(),
    maxInstallments: z.string().optional(),
  }).optional(),
  business: z.object({
    hoursStart: z.string().optional(),
    hoursEnd: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  test: z.object({
    name: z.string().optional(),
    duration: z.string().optional(),
  }).optional(),
  agent: z.object({
    name: z.string().optional(),
  }).optional(),
  coach: z.object({
    name: z.string().optional(),
  }).optional(),
  sleepCoach: z.object({
    name: z.string().optional(),
  }).optional(),
}).partial()

/**
 * Default values for call variables
 */
export const defaultCallVariables = {
  patient: {
    name: 'John Smith',
    condition: 'diabetes and hypertension',
    address: '8023 Sunny Ridge Dr',
    lastVisit: '2 days ago',
  },
  doctor: {
    name: 'Dr. Oz',
  },
  appointment: {
    date: 'December 16th',
    morningSlot: '9am',
    afternoonSlot: '3pm',
  },
  payment: {
    insuranceName: 'Blue Cross Blue Shield',
    insuranceCoverage: '80%',
    insurancePrice: '$500',
    cashPrice: '$750',
    minDownPayment: '$250',
    remainingAmount: '$150',
    secondInstallment: '$200',
    cancellationFee: '$50',
    acceptedMethods: 'Mastercard or Visa',
    maxInstallments: '4',
  },
  business: {
    hoursStart: '8am',
    hoursEnd: '7pm',
    timezone: 'Central',
  },
  test: {
    name: 'Comprehensive Home Sleep Test (CHST)',
    duration: 'three nights',
  },
  agent: {
    name: 'Brooke',
  },
  coach: {
    name: 'Emily',
  },
  sleepCoach: {
    name: 'Sarah',
  },
}

/**
 * Maps nested structure to flat format with underscores for template variables
 * @param nestedVars Nested variables object
 * @returns Flattened variables object
 */
export function flattenVariables(nestedVars: typeof defaultCallVariables) {
  const result = { ...nestedVars }
  
  // Flatten the structure by adding underscores
  const mappedVars: Record<string, string> = {
    // Patient information
    patient_name: result.patient.name,
    patient_condition: result.patient.condition,
    patient_address: result.patient.address,
    patient_last_visit: result.patient.lastVisit,
    
    // Doctor information
    doctor_name: result.doctor.name,
    
    // Appointment information
    appointment_date: result.appointment.date,
    appointment_morning: result.appointment.morningSlot,
    appointment_afternoon: result.appointment.afternoonSlot,
    morning_time: result.appointment.morningSlot,
    afternoon_time: result.appointment.afternoonSlot,
    
    // Personnel information
    agent_name: result.agent.name,
    coach_name: result.coach.name,
    sleep_coach_name: result.sleepCoach.name,
    
    // Business information
    business_hours_start: result.business.hoursStart,
    business_hours_end: result.business.hoursEnd,
    timezone: result.business.timezone,
    
    // Test information
    test_name: result.test.name,
    test_duration: result.test.duration,
    
    // Financial information
    insurance_name: result.payment.insuranceName,
    insurance_coverage: result.payment.insuranceCoverage,
    insurance_price: result.payment.insurancePrice,
    cash_price: result.payment.cashPrice,
    min_down_payment: result.payment.minDownPayment,
    remaining_payment: result.payment.remainingAmount,
    second_payment: result.payment.secondInstallment,
    cancellation_fee: result.payment.cancellationFee,
    payment_methods: result.payment.acceptedMethods,
    max_payments: result.payment.maxInstallments
  };

  // Add a JSON string version of the entire object
  mappedVars.json = JSON.stringify(result)
  
  return mappedVars;
}

/**
 * Type definition for OCR extraction schema
 */
export enum SchemaType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array'
}

/**
 * Patient schema for Gemini extraction
 */
export function definePatientSchema() {
  return {
    description: "Patient data for an intake call",
    type: SchemaType.OBJECT,
    properties: {
      patient: {
        type: SchemaType.OBJECT,
        description: "Patient information",
        properties: {
          name: {
            type: SchemaType.STRING,
            description: "Full name of the patient",
            nullable: false,
          },
          condition: {
            type: SchemaType.STRING,
            description: "Medical conditions of the patient (e.g., diabetes and hypertension)",
            nullable: false,
          },
          address: {
            type: SchemaType.STRING,
            description: "Patient's home address",
            nullable: false,
          },
          lastVisit: {
            type: SchemaType.STRING,
            description: "Patient Visit Date",
            nullable: false,
          },
        },
        nullable: true,
      },
      doctor: {
        type: SchemaType.OBJECT,
        description: "Doctor information",
        properties: {
          name: {
            type: SchemaType.STRING,
            description: "Doctor's full name with title",
            nullable: true,
          },
        },
        nullable: true,
      },
      payment: {
        type: SchemaType.OBJECT,
        description: "Payment information",
        properties: {
          insuranceName: {
            type: SchemaType.STRING,
            description: "Insurance Payor provider name",
            nullable: true,
          },
          insuranceCoverage: {
            type: SchemaType.STRING,
            description: "Coverage percentage",
            nullable: true,
          },
          insurancePrice: {
            type: SchemaType.STRING,
            description: "Price with insurance",
            nullable: true,
          },
          cashPrice: {
            type: SchemaType.STRING,
            description: "Patient Responsibility amount ($)",
            nullable: true,
          },
        },
        nullable: true,
      },
    },
    nullable: false,
  }
}

/**
 * Create a prompt for Gemini OCR extraction
 */
export function createExtractionPrompt(): string {
  let prompt = "Please analyze these documents and extract information for a patient call. "
  prompt += "Only include fields that you can confidently extract from the documents. If information is not available, omit that field."
  return prompt
}
