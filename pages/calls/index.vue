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

      <USelect v-model="callStatus" :items="[
        { label: t('queued'), value: 'queued' },
        { label: t('ended'), value: 'ended' }
      ]" />
    </div>

    <CallTable :data="filteredCalls" />
  </UContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
definePageMeta({ middleware: "auth" })
import { useCalls } from '@/composables/useCalls'
import CallTable from '@/components/CallTable.vue'

const { t } = useI18n()

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const dateRange = shallowRef({
  start: new CalendarDate(
    ...(() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
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

const callStatus = ref('ended')

const { calls, stopCurrentAudio, fetchCalls } = useCalls()

const filteredCalls = computed(() => {
  if (!dateRange.value.start || !dateRange.value.end) return calls.value
  
  const start = dateRange.value.start.toDate(getLocalTimeZone())
  const end = dateRange.value.end.toDate(getLocalTimeZone())
  
  return calls.value.filter(call => {
    const callDate = new Date(call.startedAt)
    return (
      callDate >= start &&
      callDate <= end &&
      call.status === callStatus.value
    )
  })
})

watch(dateRange, async (newRange) => {
  if (!newRange.start || !newRange.end) return
  
  const startDateTime = newRange.start.toDate(getLocalTimeZone())
  startDateTime.setHours(0, 0, 0, 0)
  
  const endDateTime = newRange.end.toDate(getLocalTimeZone())
  endDateTime.setHours(23, 59, 59, 999)
  
  const startDate = startDateTime.toISOString()
  const endDate = endDateTime.toISOString()
  await fetchCalls(startDate, endDate)
}, { immediate: true, deep: true })

onMounted(async () => {
  if (!dateRange.value.start || !dateRange.value.end) return

  const startDateTime = dateRange.value.start.toDate(getLocalTimeZone())
  startDateTime.setHours(0, 0, 0, 0)
  
  const endDateTime = dateRange.value.end.toDate(getLocalTimeZone())
  endDateTime.setHours(23, 59, 59, 999)
  
  const startDate = startDateTime.toISOString()
  const endDate = endDateTime.toISOString()
  await fetchCalls(startDate, endDate)
})

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
