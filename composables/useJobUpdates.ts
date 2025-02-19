import { ref, onMounted, onUnmounted } from 'vue'
import type { Job } from '~/composables/useJobState'

export interface JobUpdate {
  jobs: Job[]
  timestamp: Date
}

export const useJobUpdates = () => {
  const jobUpdates = ref<JobUpdate>({
    jobs: [],
    timestamp: new Date()
  })
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

      const currentJobs = JSON.stringify(jobUpdates.value.jobs)
      const newJobs = JSON.stringify(update.jobs)
      
      if(currentJobs === newJobs) {
        return
      }
      
      // Add timestamp to update
      update.timestamp = new Date().getTime();
      jobUpdates.value.timestamp = update.timestamp
      
      // Keep only last 100 updates
      if (update.jobs.length > 100) {
        update.jobs = update.jobs.slice(-100)
      }
      jobUpdates.value.jobs = update.jobs
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
