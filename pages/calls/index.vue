<template>
  <UContainer class="my-8">
    <h1 class="text-2xl font-bold mb-4">{{ t('call-list') }}</h1>

    <!-- Filters -->
    <div class="filters flex gap-4 mb-4">
      <UPopover>
        <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
          <template v-if="dateRange.start">
            <template v-if="dateRange.end">
              {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }} - {{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}
            </template>
            <template v-else>
              {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }}
            </template>
          </template>
          <template v-else>
            Pick a date
          </template>
        </UButton>

        <template #content>
          <UCalendar v-model="dateRange" class="p-2" range />
        </template>
      </UPopover>

      <USelect 
        v-model="callStatus" 
        class="w-40"
        :items="[
        { label: t('queued'), value: 'queued' },
        { label: t('ringing'), value: 'ringing' },
        { label: t('in-progress'), value: 'in-progress' },
        { label: t('forwarding'), value: 'forwarding' },
        { label: t('ended'), value: 'ended' },
        { label: t('all'), value: 'all' }
        ]" 
      />
    </div>

    <CallTable 
      :data="filteredCalls" 
      :export-button="true" 
      :is-loading-table="isLoading"
      :is-exporting="isExporting"
      :total-calls="totalCalls"
      :page-size="pageSize"
      :page="page"
      :total-pages="totalPages"
      @export="exportToExcelFile" 
      @load-more="handleLoadMore"
      @load-previous="handleLoadPrevious"
      @load-first="handleLoadFirst"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { utils, writeFile } from 'xlsx'
definePageMeta({ middleware: "auth" })
import { useCalls } from '@/composables/useCalls'
import CallTable from '@/components/CallTable.vue'
import { useRecordingUrl } from '@/composables/useRecordingUrl'
import { useExcel } from '@/composables/useExcel'

const { t } = useI18n()

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const dateRange = shallowRef({
  start: new CalendarDate(
    ...(() => {
      const d = new Date()
      d.setDate(d.getDate())
      return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    })()
  ),
  end: new CalendarDate(
    ...(() => {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    })()
  )
})

const callStatus = ref('all')

const { 
  calls, 
  stopCurrentAudio, 
  fetchCalls, 
  loadMore, 
  isLoading, 
  isExporting,
  resetCalls,
  loadPrevious,
  resetPreviousEndDates,
  totalCalls,
} = useCalls()
const { transformRecordingUrl } = useRecordingUrl()
const { exportToExcel } = useExcel()
const toast = useToast()

const pageSize = 1000
const page = ref(1)
const totalPages = computed(() => Math.ceil(totalCalls.value / pageSize))

const filteredCalls = computed(() => {
  return calls.value.filter(call => {
    return callStatus.value === 'all' || call.status === callStatus.value
  })
})

const handleLoadMore = async () => {
  if (!dateRange.value.start) return
  
  const startDateTime = dateRange.value.start.toDate(getLocalTimeZone())
  startDateTime.setHours(0, 0, 0, 0)
  
  const startDate = startDateTime.toISOString()
  await loadMore(startDate)
  page.value++;
}

const handleLoadPrevious = async () => {
  await loadPrevious()
  page.value--;
}

const handleLoadFirst = async () => {
  const startDateTime = dateRange.value.start.toDate(getLocalTimeZone())
  startDateTime.setHours(0, 0, 0, 0)
  const endDateTime = dateRange.value.end?.toDate(getLocalTimeZone())
  endDateTime?.setHours(23, 59, 59, 999)
  const startDate = startDateTime.toISOString()
  const endDate = endDateTime.toISOString()
  await fetchCalls(startDate, endDate)
  resetPreviousEndDates()
  page.value = 1
}

const exportToExcelFile = async () => {
  if (!dateRange.value.start) return

  try {
    isExporting.value = true;

    // Generate filename with date range
    const startDateStr = dateRange.value.start.toDate(getLocalTimeZone()).toLocaleDateString()
    const endDateStr = dateRange.value.end?.toDate(getLocalTimeZone()).toLocaleDateString() || startDateStr
    const filename = `calls_${startDateStr}_to_${endDateStr}.xlsx`

    exportToExcel(calls.value, {
      filename,
      sheetName: 'Calls',
      transformData: (call) => {
        const startTime = call.startedAt ? new Date(call.startedAt) : undefined
        const formattedStartTime = startTime ? startTime.toLocaleString('en-US', {
          year: 'numeric',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }) : ''

        return {
          'ID': call.id || '',
          'Assistant': call.assistant || '',
          'Phone Number': call.customer?.number || '',
          'Name': call.assistantOverrides?.variableValues?.name || '',
          'Call Received': formattedStartTime,
          'Recording URL': call.recordingUrl ? transformRecordingUrl(call.recordingUrl) : '',
          'Duration': call.duration || '',
          'Status': call.status || '',
          'Ended Reason': call.endedReason?.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') || '',
          'Tags': call.tags?.join(', ') || '',
          'Transcript': call.transcript || ''
        }
      }
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: t('error'),
      description: error.message,
      color: 'error'
    })

  } finally {
    isExporting.value = false
  }
  
}

watch(dateRange, async (newRange) => {
  if (!newRange.start || !newRange.end) return
  
  resetCalls()
  
  const startDateTime = newRange.start.toDate(getLocalTimeZone())
  startDateTime.setHours(0, 0, 0, 0)
  
  const endDateTime = newRange.end.toDate(getLocalTimeZone())
  endDateTime.setHours(23, 59, 59, 999)
  
  const startDate = startDateTime.toISOString()
  const endDate = endDateTime.toISOString()
  await fetchCalls(startDate, endDate)
  resetPreviousEndDates()
  page.value = 1
}, { immediate: true, deep: true })

onBeforeUnmount(() => {
  stopCurrentAudio()
})
</script>

<style scoped>
.filters {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>
