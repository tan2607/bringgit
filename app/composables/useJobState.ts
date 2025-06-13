export interface Job {
  id: string
  name: string
  schedule: Date
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  totalCalls: number
  completedCalls: number
  failedCalls: number
  failedNumbers: string[]
  phoneNumbers: string[]
  names: string[]
  assistantId: string
  phoneNumberId: string
  lastProcessedAt?: Date
  selectedTimeWindow: string
  notes?: string
}

interface JobState {
  jobs: Job[]
  selectedDate: Date
  openScheduleModal: boolean
  uploadStatus: string
  isFileUploaded: boolean
  phoneNumbers: string[]
  loadingJobId: string | null
  isLoading: boolean
  selectedStatus: string
  columnVisibility: {
    progress: boolean
    completedCalls: boolean
    status: boolean
  }
  total: number
  isHasMore: boolean
}

export const useJobState = () => {
  const jobState = useState<JobState>('jobState', () => ({
    jobs: [],
    selectedDate: new Date(),
    openScheduleModal: false,
    uploadStatus: 'No file uploaded',
    isFileUploaded: false,
    phoneNumbers: [],
    loadingJobId: null,
    isLoading: false,
    selectedStatus: '',
    columnVisibility: {
      progress: true,
      completedCalls: true,
      status: true
    },
    total: 0,
    isHasMore: false,
    offset: 0
  }))

  const startJob = async (jobId: string) => {
    jobState.value.loadingJobId = jobId
    try {
      const job = jobState.value.jobs.find(j => j.id === jobId)
      if (!job) return false

      // Validate phone numbers before starting
      const response = await $fetch('/api/queue/jobs', {
        method: 'POST',
        body: {
          jobId,
          phoneNumbers: job.phoneNumbers,
          names: job.names,
          assistantId: job.assistantId,
          phoneNumberId: JSON.stringify(job.phoneNumberId),
          scheduledAt: job.schedule,
          selectedTimeWindow: job.selectedTimeWindow
        }
      })

      if (response.success) {
        const jobIndex = jobState.value.jobs.findIndex(j => j.id === jobId)
        const job = jobState.value.jobs[jobIndex]

        const shouldRun = job?.schedule && new Date(job.schedule).getTime() < Date.now()

        if (jobIndex !== -1 && shouldRun) {
          jobState.value.jobs[jobIndex] = {
            ...job,
            status: 'running',
            lastProcessedAt: new Date()
          }
        }
        return true
      }

      // Handle validation errors
      if (response.error) {
        const jobIndex = jobState.value.jobs.findIndex(j => j.id === jobId)
        if (jobIndex !== -1) {
          jobState.value.jobs[jobIndex] = {
            ...jobState.value.jobs[jobIndex],
            status: 'failed',
            failedNumbers: response.failedNumbers || [],
            notes: response.error
          }
        }
      }
      
      return false
    } catch (error) {
      console.error('Error starting job:', error)
      return false
    } finally {
      jobState.value.loadingJobId = null
    }
  }

  const pauseJob = async (jobId: string) => {
    jobState.value.loadingJobId = jobId
    try {
      const response = await $fetch(`/api/jobs/status/${jobId}`, { method: 'POST', body: { status: 'paused' } })
      
      if (response.success) {
        const jobIndex = jobState.value.jobs.findIndex(job => job.id === jobId)
        if (jobIndex !== -1) {
          jobState.value.jobs[jobIndex] = {
            ...jobState.value.jobs[jobIndex],
            status: 'paused',
            lastProcessedAt: new Date()
          }

        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error pausing job:', error)
      return false
    } finally {
      jobState.value.loadingJobId = null
    }
  }

  const resumeJob = async (jobId: string) => {
    jobState.value.loadingJobId = jobId
    try {
      const response = await $fetch(`/api/jobs/status/${jobId}`, { method: 'POST', body: { status: 'running' } })
      
      if (response.success) {
        const jobIndex = jobState.value.jobs.findIndex(job => job.id === jobId)
        if (jobIndex !== -1) {
          jobState.value.jobs[jobIndex] = {
            ...jobState.value.jobs[jobIndex],
            status: 'running',
            lastProcessedAt: new Date()
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error resuming job:', error)
      return false
    } finally {
      jobState.value.loadingJobId = null
    }
  }

  const stopJob = async (jobId: string) => {
    jobState.value.loadingJobId = jobId
    try {
      const response = await $fetch(`/api/jobs/${jobId}/stop`, { method: 'POST' })
      
      if (response.success) {
        const jobIndex = jobState.value.jobs.findIndex(job => job.id === jobId)
        if (jobIndex !== -1) {
          jobState.value.jobs[jobIndex] = {
            ...jobState.value.jobs[jobIndex],
            status: 'completed',
            progress: 100,
            completedCalls: jobState.value.jobs[jobIndex].totalCalls,
            lastProcessedAt: new Date()
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error stopping job:', error)
      return false
    } finally {
      jobState.value.loadingJobId = null
    }
  }

  const createJob = async (jobData: Omit<Job, 'id' | 'status' | 'progress' | 'completedCalls' | 'failedCalls' | 'failedNumbers' | 'lastProcessedAt'>) => {
    try {
      const newJob: Job = {
        id: crypto.randomUUID(),
        ...jobData,
        status: 'pending',
        progress: 0,
        completedCalls: 0,
        failedCalls: 0,
        failedNumbers: [],
        lastProcessedAt: new Date()
      }
      
      // Save job to database first
      const response = await $fetch('/api/jobs', {
        method: 'POST',
        body: newJob
      })

      if (response.success) {
        jobState.value.jobs.push(newJob)
        await startJob(newJob.id)
        
        // Reset state
        jobState.value.phoneNumbers = []
        jobState.value.isFileUploaded = false
        jobState.value.uploadStatus = 'No file uploaded'
        jobState.value.openScheduleModal = false
        

        await getJobs();
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating job:', error)
      return false
    }
  }

  const editJob = async (jobData: Job) => {
    try {
      const response = await $fetch(`/api/jobs/${jobData.id}`, {
        method: 'PUT',
        body: jobData
      })

      if (response.success) {
        // update Job
        const jobIndex = jobState.value.jobs.findIndex(job => job.id === jobData.id)
        if (jobIndex !== -1) {
          jobState.value.jobs[jobIndex] = jobData
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error editing job:', error)
      return false
    }
  }

  const deleteJob = async (jobId: string) => {
    const response = await $fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
    if (response.success) {
      jobState.value.jobs = jobState.value.jobs.filter(job => job.id !== jobId)
      return {
        success: true,
        message: 'Job deleted successfully'
      }
    }
    return {
      success: false,
      message: 'Failed to delete job'
    }
  }

  const getJobs = async () => {
    jobState.value.isLoading = true
    try {
      const jobsData = await $fetch('/api/jobs')
      jobState.value.jobs = jobsData.jobs
      jobState.value.total = jobsData.total

      if (jobState.value.jobs.length < jobState.value.total) {
        jobState.value.isHasMore = true
      } else {
        jobState.value.isHasMore = false
      }

      return jobState.value.jobs
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    } finally {
      jobState.value.isLoading = false
    }
  }

  const getJobQueueByJobId = async (jobId: string) => {
    try {
      const jobQueueData = await $fetch(`/api/jobs/queues`, {
        query: {
          jobId
        }
      })
      return jobQueueData
    } catch (error) {
      console.error('Error getting job queue by job id:', error)
      return []
    }
  }

  const loadMoreJobs = async () => {
    jobState.value.isLoading = true
    const newOffset = jobState.value.offset + 50
    try {
      const jobsData = await $fetch('/api/jobs', {
        query: {
          offset: newOffset
        }
      })
      jobState.value.jobs.push(...jobsData.jobs)

      jobState.value.isHasMore = jobState.value.jobs.length < jobState.value.total;
    } catch (error) {
      console.error('Error loading more jobs:', error)
    } finally {
      jobState.value.offset = newOffset
      jobState.value.isLoading = false
    }
  }

  return {
    jobState,
    startJob,
    pauseJob,
    resumeJob,
    stopJob,
    createJob,
    getJobs,
    deleteJob,
    getJobQueueByJobId,
    loadMoreJobs,
    editJob
  }
}
