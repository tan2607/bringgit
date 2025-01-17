import { ref, onMounted, onUnmounted } from 'vue'
import type { JobStatus } from '~/server/utils/jobStorage'

export interface JobUpdate {
  jobId: string
  status: JobStatus
  timestamp: Date
}

export const useJobUpdates = () => {
  const jobUpdates = ref<JobUpdate[]>([])
  const connected = ref(false)
  let eventSource: EventSource | null = null

  const connect = () => {
    if (eventSource) return

    eventSource = new EventSource('/api/jobs/updates')
    
    eventSource.onopen = () => {
      connected.value = true
      console.log('Connected to job updates')
    }

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data)
      
      // Ignore ping events
      if (update.type === 'ping') return
      
      // Add timestamp to update
      update.timestamp = new Date()
      
      // Add to updates list
      jobUpdates.value.push(update)
      
      // Keep only last 100 updates
      if (jobUpdates.value.length > 100) {
        jobUpdates.value = jobUpdates.value.slice(-100)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Job updates error:', error)
      connected.value = false
      
      // Attempt to reconnect after 30 seconds
      eventSource?.close()
      eventSource = null

      setTimeout(() => {
        connect()
      }, 30000)
    }
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      connected.value = false
    }
  }

  // Get updates for a specific job
  const getJobUpdates = (jobId: string) => {
    return jobUpdates.value
      .filter(update => update.jobId === jobId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Auto-connect when mounted
  onMounted(() => {
    connect()
  })

  // Clean up on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    jobUpdates,
    connected,
    getJobUpdates,
    connect,
    disconnect
  }
}
