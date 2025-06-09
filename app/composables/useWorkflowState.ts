import type { PatientIntakeData } from '@@/shared/forms/patientIntakeSchema'

export const useWorkflowState = () => {
  // Document states
  const documentFile = useState<File | null>('workflow.documentFile', () => null)
  const documentPreview = useState<string>('workflow.documentPreview', () => '')
  const isProcessing = useState<boolean>('workflow.isProcessing', () => false)
  const error = useState<string>('workflow.error', () => '')
  const validationErrors = useState<any[]>('workflow.validationErrors', () => [])
  
  // Patient data state
  const patientData = useState<PatientIntakeData | null>('workflow.patientData', () => null)
  
  // Step tracking
  const currentStep = useState<number>('workflow.currentStep', () => 0)
  const completedSteps = useState<number[]>('workflow.completedSteps', () => [])

  // Reset all states
  const resetState = () => {
    documentFile.value = null
    documentPreview.value = ''
    isProcessing.value = false
    error.value = ''
    validationErrors.value = []
    patientData.value = null
    currentStep.value = 0
    completedSteps.value = []
  }

  // Mark step as complete
  const completeStep = (step: number) => {
    if (!completedSteps.value.includes(step)) {
      completedSteps.value = [...completedSteps.value, step]
    }
  }

  // Check if step is complete
  const isStepComplete = (step: number) => completedSteps.value.includes(step)

  // Move to next step
  const nextStep = () => {
    completeStep(currentStep.value)
    currentStep.value++
  }

  // Move to previous step
  const previousStep = () => {
    currentStep.value = Math.max(0, currentStep.value - 1)
  }

  return {
    // States
    documentFile,
    documentPreview,
    isProcessing,
    error,
    validationErrors,
    patientData,
    currentStep,
    completedSteps,
    
    // Actions
    resetState,
    completeStep,
    isStepComplete,
    nextStep,
    previousStep
  }
}
