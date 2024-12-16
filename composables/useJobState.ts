export interface Job {
  id: string
  name: string
  schedule: Date
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  totalCalls: number
  completedCalls: number
  phoneNumbers: string[]
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
}

export const useJobState = () => {
  const state = useState<JobState>('jobState', () => ({
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
    }
  }))

  const startJobProgress = (jobId: string) => {
    const interval = setInterval(() => {
      const jobIndex = state.value.jobs.findIndex(j => j.id === jobId)
      if (jobIndex === -1 || state.value.jobs[jobIndex].status !== 'running') {
        clearInterval(interval)
        return
      }
      
      const job = state.value.jobs[jobIndex]
      if (job.completedCalls < job.totalCalls) {
        job.completedCalls++
        job.progress = Math.round((job.completedCalls / job.totalCalls) * 100)
        state.value.jobs[jobIndex] = { ...job }
      } else {
        job.status = 'completed'
        job.progress = 100
        state.value.jobs[jobIndex] = { ...job }
        clearInterval(interval)
      }
    }, 1000)
  }

  const pauseJob = async (jobId: string) => {
    state.value.loadingJobId = jobId
    try {
      const jobIndex = state.value.jobs.findIndex(job => job.id === jobId)
      if (jobIndex !== -1) {
        state.value.jobs[jobIndex] = {
          ...state.value.jobs[jobIndex],
          status: 'paused'
        }
      }
      return true
    } catch (error) {
      console.error('Error pausing job:', error)
      return false
    } finally {
      state.value.loadingJobId = null
    }
  }

  const resumeJob = async (jobId: string) => {
    state.value.loadingJobId = jobId
    try {
      const jobIndex = state.value.jobs.findIndex(job => job.id === jobId)
      if (jobIndex !== -1) {
        state.value.jobs[jobIndex] = {
          ...state.value.jobs[jobIndex],
          status: 'running'
        }
        startJobProgress(jobId)
      }
      return true
    } catch (error) {
      console.error('Error resuming job:', error)
      return false
    } finally {
      state.value.loadingJobId = null
    }
  }

  const stopJob = async (jobId: string) => {
    state.value.loadingJobId = jobId
    try {
      const jobIndex = state.value.jobs.findIndex(job => job.id === jobId)
      if (jobIndex !== -1) {
        state.value.jobs[jobIndex] = {
          ...state.value.jobs[jobIndex],
          status: 'completed',
          progress: 100,
          completedCalls: state.value.jobs[jobIndex].totalCalls
        }
      }
      return true
    } catch (error) {
      console.error('Error stopping job:', error)
      return false
    } finally {
      state.value.loadingJobId = null
    }
  }

  const createJob = async (jobData: Omit<Job, 'id' | 'status' | 'progress' | 'completedCalls'>) => {
    try {
      const newJob: Job = {
        id: crypto.randomUUID(),
        ...jobData,
        status: 'pending',
        progress: 0,
        completedCalls: 0
      }
      
      state.value.jobs.push(newJob)
      newJob.status = 'running'
      startJobProgress(newJob.id)
      
      // Reset state
      state.value.phoneNumbers = []
      state.value.isFileUploaded = false
      state.value.uploadStatus = 'No file uploaded'
      state.value.openScheduleModal = false
      
      return true
    } catch (error) {
      console.error('Error creating job:', error)
      return false
    }
  }

  return {
    state,
    startJobProgress,
    pauseJob,
    resumeJob,
    stopJob,
    createJob
  }
}
