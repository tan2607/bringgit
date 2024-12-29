import { z } from 'zod'

// JSON Schema for data validation
export const patientDataSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    middleName: z.string().optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
    ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN format').optional(),
  }).optional(),
  contactInfo: z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format').optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional(),
    }).optional(),
  }).optional(),
  insurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
    primaryInsured: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    }).optional(),
  }).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    previousSurgeries: z.array(z.string()).optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format').optional(),
  }).optional(),
}).partial()

// FormKit UI Schema
export const patientIntakeFormSchema = [
  {
    "$el": "h1",
    "children": "Patient Intake Form",
    "attrs": {
      "class": "text-2xl font-bold mb-4"
    }
  },
  {
    "$el": "h2",
    "children": "Personal Information",
    "attrs": {
      "class": "text-xl font-semibold mb-2"
    }
  },
  {
    "$formkit": "text",
    "name": "personalInfo.firstName",
    "label": "First Name",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "personalInfo.lastName",
    "label": "Last Name",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "personalInfo.middleName",
    "label": "Middle Name"
  },
  {
    "$formkit": "date",
    "name": "personalInfo.dateOfBirth",
    "label": "Date of Birth",
    "validation": "required|date"
  },
  {
    "$formkit": "select",
    "name": "personalInfo.gender",
    "label": "Gender",
    "options": [
      { "label": "Male", "value": "Male" },
      { "label": "Female", "value": "Female" },
      { "label": "Other", "value": "Other" },
      { "label": "Prefer not to say", "value": "Prefer not to say" }
    ],
    "validation": "required"
  },
  {
    "$formkit": "mask",
    "name": "personalInfo.ssn",
    "label": "Social Security Number",
    "mask": "###-##-####"
  },
  {
    "$el": "h2",
    "children": "Contact Information",
    "attrs": {
      "class": "text-xl font-semibold mt-6 mb-2"
    }
  },
  {
    "$formkit": "email",
    "name": "contactInfo.email",
    "label": "Email Address",
    "validation": "required|email"
  },
  {
    "$formkit": "mask",
    "name": "contactInfo.phone",
    "label": "Phone Number",
    "mask": "(###) ###-####",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "contactInfo.address.street",
    "label": "Street Address",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "contactInfo.address.city",
    "label": "City",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "contactInfo.address.state",
    "label": "State",
    "validation": "required"
  },
  {
    "$formkit": "mask",
    "name": "contactInfo.address.zipCode",
    "label": "ZIP Code",
    "mask": "#####-####",
    "validation": "required"
  },
  {
    "$el": "h2",
    "children": "Insurance Information",
    "attrs": {
      "class": "text-xl font-semibold mt-6 mb-2"
    }
  },
  {
    "$formkit": "text",
    "name": "insurance.provider",
    "label": "Insurance Provider",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "insurance.policyNumber",
    "label": "Policy Number",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "insurance.groupNumber",
    "label": "Group Number"
  },
  {
    "$el": "fieldset",
    "attrs": {
      "class": "border rounded p-4 mt-4"
    },
    "children": [
      {
        "$el": "legend",
        "children": "Primary Insured (if different from patient)",
        "attrs": {
          "class": "text-sm font-medium px-2"
        }
      },
      {
        "$formkit": "text",
        "name": "insurance.primaryInsured.name",
        "label": "Full Name"
      },
      {
        "$formkit": "text",
        "name": "insurance.primaryInsured.relationship",
        "label": "Relationship to Patient"
      },
      {
        "$formkit": "date",
        "name": "insurance.primaryInsured.dateOfBirth",
        "label": "Date of Birth"
      }
    ]
  },
  {
    "$el": "h2",
    "children": "Medical History",
    "attrs": {
      "class": "text-xl font-semibold mt-6 mb-2"
    }
  },
  {
    "$formkit": "repeater",
    "name": "medicalHistory.allergies",
    "label": "Allergies",
    "children": [
      {
        "$formkit": "text",
        "name": "allergy",
        "label": "Allergy"
      }
    ]
  },
  {
    "$formkit": "repeater",
    "name": "medicalHistory.medications",
    "label": "Current Medications",
    "children": [
      {
        "$formkit": "text",
        "name": "medication",
        "label": "Medication"
      }
    ]
  },
  {
    "$formkit": "repeater",
    "name": "medicalHistory.conditions",
    "label": "Medical Conditions",
    "children": [
      {
        "$formkit": "text",
        "name": "condition",
        "label": "Condition"
      }
    ]
  },
  {
    "$formkit": "repeater",
    "name": "medicalHistory.previousSurgeries",
    "label": "Previous Surgeries",
    "children": [
      {
        "$formkit": "text",
        "name": "surgery",
        "label": "Surgery"
      }
    ]
  },
  {
    "$el": "h2",
    "children": "Emergency Contact",
    "attrs": {
      "class": "text-xl font-semibold mt-6 mb-2"
    }
  },
  {
    "$formkit": "text",
    "name": "emergencyContact.name",
    "label": "Full Name",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "emergencyContact.relationship",
    "label": "Relationship to Patient",
    "validation": "required"
  },
  {
    "$formkit": "mask",
    "name": "emergencyContact.phone",
    "label": "Phone Number",
    "mask": "(###) ###-####",
    "validation": "required"
  }
]

// Export type for TypeScript support
export type PatientIntakeData = z.infer<typeof patientDataSchema>