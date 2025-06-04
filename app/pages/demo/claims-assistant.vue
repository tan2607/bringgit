<template>
    <UContainer class="py-8">
        <UCard>
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-table" class="text-primary" />
                    <h3 class="text-xl font-semibold">Claims Assistant</h3>
                    <UButton icon="i-lucide-shuffle" :loading="loadingRandom" @click="fetchRandomClaims">
                        Browse Random Claims
                    </UButton>
                </div>
            </template>


            <div class="space-y-4 mb-4">
                <div class="flex gap-4">
                    <UInput v-model="invoiceNumber" placeholder="Enter Invoice Number" size="lg" class="flex-1" :ui="{
                        icon: { trailing: { pointer: true } },
                        base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75',
                        form: 'font-medium'
                    }">
                        <template #trailing>
                            <UButton color="primary" :loading="loading" :disabled="!invoiceNumber" @click="askQuestion">
                                Search
                            </UButton>
                        </template>
                    </UInput>
                </div>

                <!-- Preview Table -->
                <div v-if="previewClaims.length" class="mt-4">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-neutral-200">
                            <thead>
                                <tr>
                                    <th v-for="header in headers" :key="header"
                                        class="px-4 py-2 bg-neutral-100 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        {{ header }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-200">
                                <tr v-for="(row, index) in previewData" :key="index"
                                    :class="{ 'bg-neutral-50': index % 2 === 0 }">
                                    <td v-for="header in headers" :key="header"
                                        class="px-4 py-2 text-sm text-neutral-700">
                                        {{ row[header] }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="totalRows > previewData.length" class="mt-2 text-center text-sm text-neutral-500">
                        Showing first {{ previewData.length }} of {{ totalRows }} rows
                    </div>

                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <UBadge color="primary" variant="soft">
                                {{ totalRows }} rows
                            </UBadge>
                            <UBadge color="primary" variant="soft">
                                {{ headers.length }} columns
                            </UBadge>
                        </div>
                    </div>

                    <UTable :data="previewClaims" :columns="claimsColumns" />
                </div>
            </div>


            <div class="space-y-4">
                <UFormField label="Ask a question about your data">
                    <div class="flex gap-2">
                        <UTextarea v-model="question" :rows="3" class="w-full"
                            placeholder="e.g., What is the total revenue from Sleep Services? Which location has the highest patient satisfaction?" />
                        <UButton icon="i-lucide-mic" :color="isRecording ? 'primary' : 'neutral'"
                            :variant="isRecording ? 'solid' : 'ghost'" :loading="isTranscribing"
                            @click="handleMicClick" />
                    </div>
                    <template #help>
                        <div class="flex items-center gap-1 text-xs text-neutral-500">
                            <UIcon name="i-lucide-lightbulb" class="text-warning" />
                            <span>Try asking about revenue by category, patient satisfaction trends, or insurance type
                                distribution</span>
                        </div>
                    </template>
                </UFormField>

                <div class="space-y-3">
                    <div class="text-xs text-neutral-500 font-medium">Example questions:</div>
                    <div class="flex flex-wrap gap-2">
                        <UButton v-for="(exampleQ, index) in exampleQuestions" :key="index" size="xs" variant="soft"
                            color="neutral" class="text-xs" @click="question = exampleQ">
                            {{ exampleQ }}
                        </UButton>
                    </div>
                </div>

                <div class="flex justify-center">
                    <UButton :loading="isQuerying" :disabled="!question || isQuerying" @click="askQuestion"
                        icon="i-lucide-message-circle-question">
                        Ask Question
                    </UButton>
                </div>
            </div>

            <UCard v-if="answer || thinking" ref="answerCard" :color="error ? 'error' : 'primary'" class="p-4">
                <div class="space-y-8">
                    <!-- Claims Table -->
                    <div v-if="result?.claims?.length">
                        <div class="font-medium flex items-center gap-2 mb-2">
                            <UIcon name="i-lucide-file-warning" />
                            <span>Denied Claims</span>
                        </div>
                        <UTable :data="result.claims" :columns="claimsColumns" :sort="deniedClaimsSort"
                            @update:sort="deniedClaimsSort = $event" />
                    </div>

                    <!-- Reference Claims Table -->
                    <div v-if="result?.referenceClaims?.length">
                        <div class="font-medium flex items-center gap-2 mb-2">
                            <UIcon name="i-lucide-check-circle" />
                            <span>Reference Claims (Successfully Processed)</span>
                        </div>
                        <UTable :data="result.referenceClaims" :columns="claimsColumns" :sort="referenceClaimsSort"
                            @update:sort="referenceClaimsSort = $event" />
                    </div>

                    <!-- Answer Section -->
                    <!-- <div class="font-medium flex items-center gap-2">
                <UIcon :name="error ? 'i-lucide-alert-triangle' : 'i-lucide-message-square-text'" />
                <span>{{ error ? 'Error' : 'Answer' }}</span>
            </div> -->

                    <div v-if="thinking" class="space-y-2">
                        <UButton variant="ghost" color="neutral" class="flex items-center gap-2 text-sm"
                            @click="showThinking = !showThinking">
                            <UIcon :name="showThinking ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                                class="w-4 h-4" />
                            <span class="font-medium">Reasoning Process</span>
                        </UButton>

                        <div v-if="showThinking"
                            class="text-sm bg-white bg-opacity-10 rounded-lg p-4 whitespace-pre-wrap">
                            <MDC :value="thinking" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="font-medium">Final Answer</div>
                        <MDC :value="answer" />
                    </div>
                </div>
            </UCard>

        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const UButton = resolveComponent('UButton')
const invoiceNumber = ref('')
const loading = useState('loading', () => false)
const loadingRandom = ref(false)
const previewClaims = ref([{ "Invoice Number": "714749", "Sales Order Number": "228704", "Branch": "Vitalus Sleep 683 Inc.", "SO Confirm Date": "11/16/2023", "Classification": "Comprehensive Home Sleep Test with WST and IST - 5", "Actual Date": "9/22/2023", "Patient ID": "44902", "Referring Provider Name": "WRIGHT, RANDALL JOHN", "Rendering Provider Name": "", "Invoice Date of Service": "9/23/2023 0:00", "Invoice Branch": "Vitalus Sleep 683 Inc.", "Invoice Document Date": "11/17/2023 5:06", "Invoice Box 24Jb": "1447491683", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "7/22/1967", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "G47.33 ", "Payor": "BCBS OF TX (INN)", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "9/23/2023 0:00", "Charge": "$819.00 ", "Allow": "$619.87 ", "Payments": "$0.00 ", "Adjustments": "$819.00 ", "Balance": "$0.00 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "216", "Invoice Detail Line Level Remark Description": "Based on the findings of a review organization" }, { "Invoice Number": "768092", "Sales Order Number": "230425", "Branch": "Vitalus Sleep 683 Inc.", "SO Confirm Date": "5/7/2024", "Classification": "Titration - Comprehensive Home Auto PAP", "Actual Date": "4/10/2024", "Patient ID": "58176", "Referring Provider Name": "Aggarwala, Gaurav *Huntsville*", "Rendering Provider Name": "", "Invoice Date of Service": "4/12/2024 0:00", "Invoice Branch": "Vitalus Sleep 683 Inc.", "Invoice Document Date": "5/8/2024 4:55", "Invoice Box 24Jb": "1447491683", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "10/12/1969", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "G47.33 ", "Payor": "BCBS OF TX (INN)", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "4/12/2024 0:00", "Charge": "$819.00 ", "Allow": "$619.87 ", "Payments": "$0.00 ", "Adjustments": "$199.13 ", "Balance": "$619.87 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "M127", "Invoice Detail Line Level Remark Description": "Missing patient medical record for this service." }, { "Invoice Number": "784814", "Sales Order Number": "244817", "Branch": "Vitalus Airway 562 (out)", "SO Confirm Date": "8/21/2024", "Classification": "Ambulatory Wakefulness Test- AWT", "Actual Date": "8/12/2024", "Patient ID": "60990", "Referring Provider Name": "BUTLER, ANDREW S", "Rendering Provider Name": "WRIGHT, RANDALL JOHN", "Invoice Date of Service": "8/12/2024 0:00", "Invoice Branch": "Vitalus Airway 562 (out)", "Invoice Document Date": "8/27/2024 5:09", "Invoice Box 24Jb": "1356686562", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "10/13/1988", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": " ", "Patient Dx ICD-10 Code #03": " ", "Payor": "BCBS OF TX (INN)", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "8/12/2024 0:00", "Charge": "$15,000.00 ", "Allow": "$2,000.00 ", "Payments": "$49.69 ", "Adjustments": "$13,000.00 ", "Balance": "$1,950.31 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "N830", "Invoice Detail Line Level Remark Description": "" }, { "Invoice Number": "686940", "Sales Order Number": "227167", "Branch": "Vitalus Airway 984 (inn)", "SO Confirm Date": "9/4/2023", "Classification": "DME - New PAP Setup", "Actual Date": "7/31/2023", "Patient ID": "57512", "Referring Provider Name": "", "Rendering Provider Name": "", "Invoice Date of Service": "7/31/2023 0:00", "Invoice Branch": "Vitalus Airway 984 (inn)", "Invoice Document Date": "9/5/2023 4:16", "Invoice Box 24Jb": "1639228984", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "1/11/1946", "Patient Dx ICD-10 Code #01": "G47.33 ", "Patient Dx ICD-10 Code #02": "F22 ", "Patient Dx ICD-10 Code #03": "G93.40 ", "Payor": "United Healthcare", "Payor Level": "Primary", "Item ID": "RSM-36850", "Item Name": "Disposable Filter- S/9airsense10- 1 pack", "DOS From": "7/31/2023 0:00", "Charge": "$34.02 ", "Allow": "$11.34 ", "Payments": "$5.09 ", "Adjustments": "$28.93 ", "Balance": "$0.00 ", "Qty": "1", "Proc Code": "A7038", "Modifier 1": "NU", "Modifier 2": "KX", "Invoice Detail Item Group": "CPAP/BiLevel Masks", "Remark Code1": "N702", "Invoice Detail Line Level Remark Description": "" }, { "Invoice Number": "761767", "Sales Order Number": "226126", "Branch": "Vitalus Airway 984 (inn)", "SO Confirm Date": "9/6/2023", "Classification": "DME - New PAP Setup", "Actual Date": "7/27/2023", "Patient ID": "34465", "Referring Provider Name": "", "Rendering Provider Name": "", "Invoice Date of Service": "3/27/2024 0:00", "Invoice Branch": "Vitalus Airway 984 (inn)", "Invoice Document Date": "3/27/2024 5:53", "Invoice Box 24Jb": "1639228984", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "2/27/1976", "Patient Dx ICD-10 Code #01": "G47.33 ", "Patient Dx ICD-10 Code #02": " ", "Patient Dx ICD-10 Code #03": " ", "Payor": "United Healthcare", "Payor Level": "Primary", "Item ID": "B-Humidifier Billing", "Item Name": "Heated Humidifier For CPAP/APAP", "DOS From": "3/27/2024 0:00", "Charge": "$111.95 ", "Allow": "$10.43 ", "Payments": "$0.00 ", "Adjustments": "$101.52 ", "Balance": "$10.43 ", "Qty": "1", "Proc Code": "E0562", "Modifier 1": "RR", "Modifier 2": "", "Invoice Detail Item Group": "CPAP/Bilevel Supplies", "Remark Code1": "252", "Invoice Detail Line Level Remark Description": "An attachment/other documentation is required to adjudicate this claim/service. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT)." }, { "Invoice Number": "690810", "Sales Order Number": "202011", "Branch": "Vitalus Airway 984 (inn)", "SO Confirm Date": "9/8/2023", "Classification": "Comprehensive Home Sleep Test with IST - 5 Nights", "Actual Date": "8/14/2023", "Patient ID": "56022", "Referring Provider Name": "WRIGHT, RANDALL JOHN", "Rendering Provider Name": "", "Invoice Date of Service": "8/19/2023 0:00", "Invoice Branch": "Vitalus Airway 984 (inn)", "Invoice Document Date": "9/9/2023 5:09", "Invoice Box 24Jb": "1639228984", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "M127", "Remark Description": "Missing patient medical record for this service.", "Patient DOB": "12/3/1994", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "G47.33 ", "Payor": "United Healthcare", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "8/19/2023 0:00", "Charge": "$4,198.00 ", "Allow": "$1,679.20 ", "Payments": "$0.00 ", "Adjustments": "$2,518.80 ", "Balance": "$1,679.20 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "M127", "Invoice Detail Line Level Remark Description": "Missing patient medical record for this service." }, { "Invoice Number": "678188", "Sales Order Number": "225323", "Branch": "Vitalus Sleep 683 Inc.", "SO Confirm Date": "8/6/2023", "Classification": "Comprehensive Home Sleep Test with WST and IST - 5", "Actual Date": "6/23/2023", "Patient ID": "56941", "Referring Provider Name": "WRIGHT, RANDALL JOHN", "Rendering Provider Name": "", "Invoice Date of Service": "6/29/2023 0:00", "Invoice Branch": "Vitalus Sleep 683 Inc.", "Invoice Document Date": "8/7/2023 4:15", "Invoice Box 24Jb": "1447491683", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "10/30/1947", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "G47.33 ", "Payor": "BCBS OF TX (INN)", "Payor Level": "Primary", "Item ID": "95723", "Item Name": "95723 - EEG PHY/QHP w/o vid, prof only", "DOS From": "6/29/2023 0:00", "Charge": "$1,187.55 ", "Allow": "$237.51 ", "Payments": "$0.00 ", "Adjustments": "$997.54 ", "Balance": "$190.01 ", "Qty": "1", "Proc Code": "95723", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "M127", "Invoice Detail Line Level Remark Description": "Missing patient medical record for this service." }, { "Invoice Number": "766655", "Sales Order Number": "237368", "Branch": "Vitalus Sleep 683 Inc.", "SO Confirm Date": "4/24/2024", "Classification": "Comprehensive Home Sleep Test with WST and IST - 5", "Actual Date": "3/12/2024", "Patient ID": "59511", "Referring Provider Name": "WRIGHT, RANDALL JOHN", "Rendering Provider Name": "", "Invoice Date of Service": "3/13/2024 0:00", "Invoice Branch": "Vitalus Sleep 683 Inc.", "Invoice Document Date": "4/25/2024 5:09", "Invoice Box 24Jb": "1447491683", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "12/11/1991", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "G47.33 ", "Payor": "BCBS OF TX (INN)", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "3/13/2024 0:00", "Charge": "$819.00 ", "Allow": "$619.87 ", "Payments": "$0.00 ", "Adjustments": "$199.13 ", "Balance": "$619.87 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "216", "Invoice Detail Line Level Remark Description": "Based on the findings of a review organization" }, { "Invoice Number": "675338", "Sales Order Number": "225486", "Branch": "Vitalus Sleep 683 Inc.", "SO Confirm Date": "7/23/2023", "Classification": "Comprehensive Home Sleep Test with WST and IST - 5", "Actual Date": "6/12/2023", "Patient ID": "56988", "Referring Provider Name": "WRIGHT, RANDALL JOHN", "Rendering Provider Name": "", "Invoice Date of Service": "6/16/2023 0:00", "Invoice Branch": "Vitalus Sleep 683 Inc.", "Invoice Document Date": "7/24/2023 4:05", "Invoice Box 24Jb": "1447491683", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "4/19/1964", "Patient Dx ICD-10 Code #01": "R40.0 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "G47.33 ", "Payor": "BCBS OF TX (INN)", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "6/16/2023 0:00", "Charge": "$819.00 ", "Allow": "$619.87 ", "Payments": "$619.87 ", "Adjustments": "$199.13 ", "Balance": "$0.00 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "M127", "Invoice Detail Line Level Remark Description": "Missing patient medical record for this service." }, { "Invoice Number": "689655", "Sales Order Number": "202803", "Branch": "Vitalus Airway 984 (inn)", "SO Confirm Date": "9/7/2023", "Classification": "Comprehensive Home Sleep Test with WST - 3 Nights", "Actual Date": "8/14/2023", "Patient ID": "56320", "Referring Provider Name": "WRIGHT, RANDALL JOHN", "Rendering Provider Name": "", "Invoice Date of Service": "8/16/2023 0:00", "Invoice Branch": "Vitalus Airway 984 (inn)", "Invoice Document Date": "9/8/2023 4:55", "Invoice Box 24Jb": "1639228984", "Invoice Include Box 24Jb": "TRUE", "Remark Code": "", "Remark Description": "", "Patient DOB": "11/27/1954", "Patient Dx ICD-10 Code #01": "G47.33 ", "Patient Dx ICD-10 Code #02": "G47.00 ", "Patient Dx ICD-10 Code #03": "E11.9 ", "Payor": "United Healthcare", "Payor Level": "Primary", "Item ID": "95705", "Item Name": "95705 - EEG w/o Video", "DOS From": "8/16/2023 0:00", "Charge": "$4,198.00 ", "Allow": "$1,679.20 ", "Payments": "$1,626.02 ", "Adjustments": "$2,571.98 ", "Balance": "$0.00 ", "Qty": "1", "Proc Code": "95705", "Modifier 1": "", "Modifier 2": "", "Invoice Detail Item Group": "NDX_Diagnostic Studies", "Remark Code1": "253", "Invoice Detail Line Level Remark Description": "Sequestration - reduction in federal payment" }])

const claimsColumns = [
    {
        accessorKey: 'Invoice Number', header: '', cell: (row) => {
            return h(UButton, {
                icon: 'i-lucide-brain',
                size: 'sm',
                color: 'primary',
                variant: 'ghost',
                class: 'hover:scale-110 transition-transform',
                onClick: () => selectClaim(row.original)
            })
        }
    },
    { accessorKey: 'Invoice Number', header: 'Invoice #' },
    { accessorKey: 'Proc Code', header: 'Proc Code' },
    { accessorKey: 'Item Name', header: 'Description' },
    { accessorKey: 'Payor', header: 'Payor' },
    {
        accessorKey: 'Charge',
        header: 'Charge'
    },
    {
        accessorKey: 'Allow',
        header: 'Allow'
    },
    {
        accessorKey: 'Payments',
        header: 'Payments'
    },
    {
        accessorKey: 'Adjustments',
        header: 'Adjustments'
    },
    {
        accessorKey: 'Remark Code1',
        header: 'Remark Code',
        sortable: true
    }
]

const deniedClaimsSort = ref({
    column: 'Invoice Number',
    direction: 'asc'
})

const referenceClaimsSort = ref({
    column: 'Invoice Number',
    direction: 'asc'
})
const stepper = ref()
const fileInput = ref<HTMLInputElement>()
const answerCard = ref<HTMLElement>()
const fileName = ref('')
const filePreview = ref(false)
const isProcessing = ref(false)
const isQuerying = ref(false)
const error = ref('')
const headers = ref<string[]>([])
const previewData = ref<any[]>([])
const totalRows = ref(0)
const question = ref('Why is the claim denied?')
const answer = ref('')
const thinking = ref('')
const result = ref({})
const showThinking = ref(false)
const rawData = ref('')
const isRecording = ref(false)
const isTranscribing = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const toast = useToast()

// Voice input settings
const quality = ref<'fast' | 'standard' | 'high'>('standard')
const formality = ref<'formal' | 'informal'>('formal')
const temperature = ref(0.2)
const selectedLanguage = ref('en')

const exampleQuestions = [
    "Why was this claim denied?",
    "What are the specific reasons for claim rejection?",
    "Is there a pattern of denials for similar procedures?",
    "What documentation is missing for this claim?",
    "How does this claim compare to successfully processed claims?",
    "What are the recommended actions to resolve this denial?"
]

function resetForm() {
    if (fileInput.value) fileInput.value.value = ''
    fileName.value = ''
    filePreview.value = false
    error.value = ''
    headers.value = []
    previewData.value = []
    question.value = ''
    answer.value = ''
    thinking.value = ''
}

function handleDrop(e: DragEvent) {
    const dt = e.dataTransfer
    if (!dt?.files) return
    processFile(dt.files[0])
}

function handleFileInput(e: Event) {
    const target = e.target as HTMLInputElement
    if (!target.files?.length) return
    processFile(target.files[0])
}

async function processFile(file: File) {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
        error.value = 'File size exceeds 5MB limit'
        return
    }

    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
        error.value = 'Invalid file type. Please upload a CSV or Excel file.'
        return
    }

    isProcessing.value = true
    error.value = ''

    try {
        const text = await file.text()
        rawData.value = text

        // Parse CSV
        const rows = text.split('\n').map(row => row.split(','))
        headers.value = rows[0]
        const dataRows = rows.slice(1).filter(row => row.length === headers.value.length)

        totalRows.value = dataRows.length
        previewData.value = dataRows.slice(0, 10).map(row => {
            const obj: Record<string, string> = {}
            headers.value.forEach((header, index) => {
                obj[header] = row[index]
            })
            return obj
        })

        fileName.value = file.name
        filePreview.value = true
    } catch (err: any) {
        error.value = err.message || 'Failed to process file'
    } finally {
        isProcessing.value = false
    }
}

async function parseAnswer(response: string) {
    let answerText = ''

    // First look for Final Answer section
    const finalAnswerMatch = response.match(/Answer:(.+)/s)
    if (finalAnswerMatch) {
        // Everything before "Final Answer" goes into thinking
        const [beforeFinal, finalAnswer] = response.split('Answer:')
        thinking.value = beforeFinal.trim()
        answerText = finalAnswer.trim()
    } else {
        // If no Final Answer, extract thinking tags and use remaining text
        const thinkingMatch = response.match(/<think>(.*?)<\/think>/s)
        if (thinkingMatch) {
            let thinkingText = thinkingMatch[1]?.trim() || ''
            // Remove tags from thinkingText, keep the content
            thinkingText = thinkingText.replace(/<[^>]*>/g, '').trim()
            thinking.value = thinkingText

            // Use any text outside of think tags as the answer
            answerText = response.replace(/<think>.*?<\/think>/s, '').trim()
        } else {
            // No think tags or Final Answer, use whole response
            answerText = response.trim()
        }
    }

    // Set the answer
    answer.value = answerText
}

async function selectClaim(row: any) {
    console.log(row)
    invoiceNumber.value = row['Invoice Number']
    // await askQuestion()
}

async function fetchRandomClaims() {
    loadingRandom.value = true
    try {
        const response = await $fetch('/api/claims/random')
        previewClaims.value = response.claims

        totalRows.value = previewClaims.value.length
        headers.value = Object.keys(previewClaims.value[0])
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Failed to fetch random claims'
    } finally {
        loadingRandom.value = false
    }
}

async function askQuestion() {
    if (!invoiceNumber.value) {
        error.value = 'Please enter an Invoice Number'
        return
    }

    loading.value = true
    isQuerying.value = true
    error.value = ''
    answer.value = ''
    thinking.value = ''
    showThinking.value = false
    result.value = null

    try {
        const response = await $fetch('/api/claims/query', {
            method: 'POST',
            body: {
                invoiceNumber: invoiceNumber.value,
                question: question.value || 'Why is the claim denied?'
            }
        })

        result.value = response
        if (response.answer) {
            parseAnswer(response.answer)
        }

        // Wait for the answer card to be rendered
        await nextTick()
        // Scroll the answer into view with smooth animation
        answerCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Failed to process question'
        answer.value = 'Sorry, there was an error processing your question. Please try again.'
    } finally {
        loading.value = false
        isQuerying.value = false
    }
}

async function handleMicClick() {
    if (!navigator.mediaDevices?.getUserMedia) {
        console.error('Media devices not supported')
        toast.add({
            title: 'Error',
            description: 'Your browser does not support voice recording',
            color: 'error'
        })
        return
    }

    if (isRecording.value) {
        // Stop recording
        isRecording.value = false
        if (mediaRecorder.value?.state === 'recording') {
            mediaRecorder.value.stop()
        }
    } else {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const chunks: Blob[] = []

            const recorder = new MediaRecorder(stream)
            mediaRecorder.value = recorder

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' })
                stream.getTracks().forEach(track => track.stop())
                await handleTranscription(audioBlob)
            }

            recorder.start()
            isRecording.value = true

            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop()
                    isRecording.value = false
                }
            }, 10000)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            toast.add({
                title: 'Error',
                description: 'Could not access microphone',
                color: 'error'
            })
            isRecording.value = false
        }
    }
}

async function handleTranscription(audioBlob: Blob) {
    isTranscribing.value = true
    try {
        const audioFormData = new FormData()
        audioFormData.append('audio', audioBlob, 'recording.wav')
        const options = {
            targetLanguage: 'en',
            sourceLanguage: selectedLanguage.value,
            quality: quality.value,
            temperature: temperature.value,
            prompt: 'Translate medical terminology accurately and maintain formal tone',
            formality: formality.value
        }
        audioFormData.append('options', JSON.stringify(options))
        audioFormData.append('provider', 'whisper')

        const response = await fetch('/api/voice/translation', {
            method: 'POST',
            body: audioFormData
        })

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        const data = await response.json()

        if (data.error) {
            throw new Error(data.error)
        }

        if (data.translatedText) {
            question.value = data.translatedText
        }
    } catch (error) {
        console.error('Transcription error:', error)
        toast.add({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to transcribe audio',
            color: 'error'
        })
    } finally {
        isTranscribing.value = false
    }
}
</script>

<style scoped>
.drop-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 200px;
    padding: 20px;
    border-radius: 10px;
    border: 2px dashed var(--color-gray-300);
    color: var(--color-gray-700);
    cursor: pointer;
    transition: background .2s ease-in-out, border .2s ease-in-out;
}

.drop-container:hover {
    background: var(--color-gray-50);
    border-color: var(--color-gray-400);
}

.drop-container.drag-active {
    background: var(--color-gray-100);
    border-color: var(--color-gray-500);
}

.drop-container input[type=file] {
    width: 350px;
    max-width: 100%;
    color: var(--color-gray-700);
    padding: 2px;
    background: white;
    border-radius: 10px;
    border: 1px solid var(--color-gray-200);
}

.drop-container input[type=file]::file-selector-button {
    margin-right: 20px;
    border: none;
    background: var(--color-primary);
    padding: 10px 20px;
    border-radius: 10px;
    color: white;
    cursor: pointer;
}

.drop-container input[type=file]::file-selector-button:hover {
    background: var(--color-primary-400);
}

.drop-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    transition: color .2s ease-in-out;
}
</style>