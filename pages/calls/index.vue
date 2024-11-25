<template>
  <UContainer class="my-8">
    <h1 class="text-2xl font-bold mb-4">{{ t('call-list') }}</h1>

    <!-- Filters -->
    <div class="filters flex gap-4 mb-4">
      <div class="flex gap-2">
        <UInput type="date" v-model="startDate" />
        <UInput type="date" v-model="endDate" />
      </div>

      <USelect v-model="callStatus" :items="[
        { label: t('queued'), value: 'queued' },
        { label: t('ended'), value: 'ended' }
      ]" />
    </div>

    <CallTable :data="filteredCalls" />

    <TranscriptModal />
  </UContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
definePageMeta({ middleware: "auth" })
import { useCalls } from '@/composables/useCalls'
import CallTable from '@/components/CallTable.vue'
import TranscriptModal from '@/components/TranscriptModal.vue'

const { t } = useI18n()

const startDate = ref(new Date(Date.now() - (7 * 86400000)).toISOString().split('T')[0])
const endDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])
const callStatus = ref('ended')

const { calls, stopCurrentAudio, fetchCalls } = useCalls()

const filteredCalls = computed(() => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  
  return calls.value.filter(call => {
    const callDate = new Date(call.startedAt)
    return (
      callDate >= start &&
      callDate <= end &&
      call.status === callStatus.value
    )
  })
})

onMounted(async () => {
  await fetchCalls()
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
