import { createError } from 'h3'
import { readFiles } from 'h3-formidable'
import { GeminiOCR } from '../utils/providers/gemini'
import { BrightreeScheduling } from '../utils/providers/brightree'
import { readFile } from 'fs/promises'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp'
]

export default defineEventHandler(async (event) => {
  try {
    console.log('Processing document extraction for call variables...')
    
    // Parse multipart form data
    const { files } = await readFiles(event, {
      includeFields: true
    })

    // Check for required files
    if (!files?.medicalRecord && !files?.insuranceCard) {
      throw createError({
        statusCode: 400,
        message: 'At least one file is required for extraction',
      })
    }

    // Get files (optional files are allowed)
    const medicalRecord = files.medicalRecord 
      ? (Array.isArray(files.medicalRecord) ? files.medicalRecord[0] : files.medicalRecord)
      : null
      
    const insuranceCard = files.insuranceCard
      ? (Array.isArray(files.insuranceCard) ? files.insuranceCard[0] : files.insuranceCard)
      : null

    // Validate files if they exist
    const filesToValidate = [medicalRecord, insuranceCard].filter(Boolean)
    
    for (const file of filesToValidate) {
      if (file.size > MAX_FILE_SIZE) {
        throw createError({
          statusCode: 400,
          message: `File ${file.originalFilename} exceeds 5MB limit`,
        })
      }

      // Validate mime type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype || 'application/octet-stream')) {
        throw createError({
          statusCode: 400,
          message: `Invalid file type for ${file.originalFilename}. Supported formats: PDF, JPEG, PNG, TIFF, BMP`,
        })
      }
    }

    const config = useRuntimeConfig()
    if (!config.geminiApiKey) {
      throw createError({
        statusCode: 500,
        message: 'Gemini API key not configured',
      })
    }

    // Read file buffers if they exist
    const fileBuffers = {
      medicalRecord: medicalRecord ? await readFile(medicalRecord.filepath) : null,
      insuranceCard: insuranceCard ? await readFile(insuranceCard.filepath) : null,
    }

    const fileMimeTypes = {
      medicalRecord: medicalRecord?.mimetype || 'application/octet-stream',
      insuranceCard: insuranceCard?.mimetype || 'application/octet-stream',
    }

    // Process with Gemini OCR with custom prompt for call variables
    const ocr = new GeminiOCR(config.geminiApiKey)
    
    // Prepare files for processing
    const filesToProcess = []
    if (fileBuffers.medicalRecord) {
      filesToProcess.push({
        buffer: fileBuffers.medicalRecord,
        mimeType: fileMimeTypes.medicalRecord,
        type: 'medicalRecord'
      })
    }
    
    if (fileBuffers.insuranceCard) {
      filesToProcess.push({
        buffer: fileBuffers.insuranceCard,
        mimeType: fileMimeTypes.insuranceCard,
        type: 'insuranceCard'
      })
    }

    // Custom extraction for call variables
    const extractedData = await ocr.extractCallVariables(filesToProcess)

    // Check if we need to fetch appointment availability from Brightree
    let appointmentAvailability = null
    if (config.brightreeUsername && config.brightreePassword) {
      try {
        // Initialize Brightree client
        const brightree = new BrightreeScheduling(
          config.brightreeUsername,
          config.brightreePassword
        )
        
        // Get today's date and date 14 days from now
        const today = new Date()
        const twoWeeksLater = new Date()
        twoWeeksLater.setDate(today.getDate() + 14)
        
        // Format dates as YYYY-MM-DD
        const startDate = today.toISOString().split('T')[0]
        const endDate = twoWeeksLater.toISOString().split('T')[0]
        
        // Get appointment availability
        appointmentAvailability = await brightree.getMockAppointmentAvailability(
          startDate,
          endDate
        )
      } catch (error) {
        console.warn('Failed to fetch appointment availability from Brightree, using mock data', error)
        
        // Use mock data if the API call fails
        const brightree = new BrightreeScheduling('', '')
        
        // Get today's date and date 14 days from now
        const today = new Date()
        const twoWeeksLater = new Date()
        twoWeeksLater.setDate(today.getDate() + 14)
        
        // Format dates as YYYY-MM-DD
        const startDate = today.toISOString().split('T')[0]
        const endDate = twoWeeksLater.toISOString().split('T')[0]
        
        appointmentAvailability = await brightree.getMockAppointmentAvailability(startDate, endDate)
      }
      
      // If we have appointment availability, add it to the extracted data
      if (appointmentAvailability && appointmentAvailability.length > 0) {
        // Use the first available date
        const firstAvailable = appointmentAvailability[0]
        
        if (!extractedData.appointment) {
          extractedData.appointment = {}
        }
        
        extractedData.appointment.date = firstAvailable.date
        extractedData.appointment.morningSlot = firstAvailable.availableTimes
      }
    }

    // Apply business rules and process the data further
    const processedData = processExtractedData(extractedData, appointmentAvailability)

    return {
      success: true,
      data: processedData
    }
  } catch (error: any) {
    console.error('Document Extraction Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

// Apply business rules to the extracted data
function processExtractedData(data: any, appointmentAvailability?: any[]) {
  // Set default values for anything not extracted
  const processed = {
    patient: {
      name: data.patient?.name || 'Unknown Patient',
      condition: data.patient?.condition || 'diabetes and hypertension',
      address: data.patient?.address || '8023 Sunny Ridge Dr',
      lastVisit: data.patient?.lastVisit || '2 days ago',
    },
    doctor: {
      name: data.doctor?.name || 'Dr. Oz',
    },
    appointment: {
      date: data.appointment?.date || 'December 16th',
      // Process available times or use defaults
      morningSlot: data.appointment?.availableTimes?.[0] || '9am',
      afternoonSlot: data.appointment?.availableTimes?.[1] || '3pm',
    },
    payment: {
      insuranceName: data.payment?.insuranceName || 'Blue Cross Blue Shield',
      insuranceCoverage: data.payment?.insuranceCoverage || '80%',
      insurancePrice: data.payment?.insurancePrice || '$500',
      cashPrice: data.payment?.cashPrice || '$750',
      // Computed values
      minDownPayment: data.payment?.minDownPayment || '$250',
      remainingAmount: data.payment?.remainingAmount || '$150',
      secondInstallment: data.payment?.secondInstallment || '$200',
      cancellationFee: data.payment?.cancellationFee || '$50',
      acceptedMethods: 'Mastercard or Visa', // Business constant
      maxInstallments: '4', // Business constant
    },
    business: {
      hoursStart: '8am', // Business constant
      hoursEnd: '7pm', // Business constant
      timezone: 'Central', // Business constant
    },
    test: {
      name: 'Comprehensive Home Sleep Test (CHST)', // Business constant
      duration: 'three nights', // Business constant
    },
    agent: {
      name: 'Brooke', // Business constant
    },
    coach: {
      name: 'Emily', // Business constant
    },
    // Include the full appointment availability data for the UI
    appointmentAvailability: appointmentAvailability || []
  }

  return processed
}
