<template>
  <UContainer class="p-4">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">{{ t('access-control.title') }}</h1>
      </div>
    </div>
    <AccessControlTable />
  </UContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AccessControlTable from '@/components/AcessControlTable.vue'

const { t } = useI18n()

</script>

<style lang="scss" scoped>

</style>