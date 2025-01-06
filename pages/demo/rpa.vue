<template>
  <UContainer class="py-8">
    <RpaTask
      :initial-url="initialUrl"
      :initial-task-description="initialTaskDescription"
      @success="handleSuccess"
      @error="handleError"
    />
  </UContainer>
</template>

<script setup lang="ts">
import RpaTask from '~/components/RpaTask.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const toast = useToast()

// Get initial values from query parameters
const initialUrl = computed(() => route.query.url as string || '')
const initialTaskDescription = computed(() => route.query.taskDescription as string || '')

const handleSuccess = () => {
  toast.add({
    title: 'Success',
    description: 'RPA task completed successfully',
    color: 'success',
    icon: 'i-lucide-check-circle'
  })
}

const handleError = (error: string) => {
  toast.add({
    title: 'Error',
    description: error || 'Failed to execute RPA task',
    color: 'error',
    icon: 'i-lucide-alert-circle'
  })
}
</script>
