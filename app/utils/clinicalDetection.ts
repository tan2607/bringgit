// Clinical keywords that should trigger warnings
const clinicalKeywords = {
  medical: [
    'allergy', 'allergic', 'allergies',
    'medication', 'medications', 'medicine', 'medicines',
    'symptom', 'symptoms',
    'condition', 'conditions',
    'disease', 'diseases',
    'diagnosis', 'diagnoses',
    'treatment', 'treatments',
    'surgery', 'surgeries',
    'prescription', 'prescriptions',
    'medical history',
    'health condition',
    'side effect', 'side effects',
  ],
  symptoms: [
    'pain', 'ache', 'sore',
    'fever', 'temperature',
    'cough', 'coughing',
    'headache', 'migraine',
    'nausea', 'vomiting',
    'dizziness', 'dizzy',
    'rash', 'itching',
    'swelling',
    'bleeding',
    'fatigue', 'tired',
    'shortness of breath',
  ],
  medications: [
    // Common medication types
    'dose', 'dosage',
    'pill', 'pills',
    'tablet', 'tablets',
    'capsule', 'capsules',
    'injection', 'injections',
    'antibiotic', 'antibiotics',
    'prescription',
    'inhaler',
    'medicine', 'medication',
    
    // Common medication names
    'paracetamol', 'acetaminophen', 'tylenol',
    'ibuprofen', 'advil', 'motrin',
    'aspirin', 'bayer',
    'amoxicillin', 'penicillin',
    'omeprazole', 'prilosec',
    'metformin', 'glucophage',
    'lisinopril', 'zestril',
    'amlodipine', 'norvasc',
    'metoprolol', 'lopressor',
    'levothyroxine', 'synthroid',
    'atorvastatin', 'lipitor',
    'simvastatin', 'zocor',
    'sertraline', 'zoloft',
    'fluoxetine', 'prozac',
    'gabapentin', 'neurontin',
    'lorazepam', 'ativan',
    'alprazolam', 'xanax',
    'prednisone', 'deltasone',
    'insulin',
    
    // Classes of medications
    'antidepressant', 'antidepressants',
    'antihistamine', 'antihistamines',
    'antipsychotic', 'antipsychotics',
    'statin', 'statins',
    'steroid', 'steroids',
    'painkiller', 'painkillers',
    'antibiotic', 'antibiotics',
    'antiviral', 'antivirals',
    'sedative', 'sedatives',
    'supplement', 'supplements',
    'vitamin', 'vitamins'
  ]
};

/**
 * Checks if text contains clinical content that should trigger a warning
 * @param text The text to check for clinical content
 * @returns boolean indicating if clinical content was detected
 */
export function hasClinicalContent(text: string): boolean {
  const normalizedText = text.toLowerCase();
  
  // Check each category of keywords
  for (const category of Object.values(clinicalKeywords)) {
    for (const keyword of category) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalizedText)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get the clinical warning message
 * @returns Warning message for clinical content
 */
export function getClinicalWarningMessage(): string {
  return "Clinical content detected. Please ensure a qualified medical translator reviews this content for accuracy.";
}
