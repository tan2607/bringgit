import type { Job } from './jobStorage'

export interface JobMetrics {
  successRate: number
  avgCallDuration: number
  peakHours: { hour: number; count: number }[]
  costPerCall: number
  failureReasons: Map<string, number>
  totalCost: number
  completionTime: number // minutes
}

export interface TimeRange {
  start: Date
  end: Date
}

export interface AnalyticsFilters {
  timeRange?: TimeRange
  status?: string[]
  assistantIds?: string[]
  phoneNumberIds?: string[]
}

export class AnalyticsService {
  constructor() {}

  async getJobMetrics(jobId: string): Promise<JobMetrics> {
    const job = await useJobStorage().getJob(jobId)
    if (!job) throw new Error('Job not found')

    return this.calculateMetrics(job)
  }

  async getBatchMetrics(filters: AnalyticsFilters): Promise<{
    jobs: number
    totalCalls: number
    metrics: JobMetrics
  }> {
    const storage = useJobStorage()
    const jobs = await storage.getJobs(filters)

    const aggregateMetrics = jobs.reduce(
      (acc, job) => {
        const metrics = this.calculateMetrics(job)
        return {
          jobs: acc.jobs + 1,
          totalCalls: acc.totalCalls + job.totalCalls,
          metrics: this.aggregateMetrics(acc.metrics, metrics)
        }
      },
      {
        jobs: 0,
        totalCalls: 0,
        metrics: this.getEmptyMetrics()
      }
    )

    // Average out the aggregated metrics
    if (aggregateMetrics.jobs > 0) {
      aggregateMetrics.metrics.successRate /= aggregateMetrics.jobs
      aggregateMetrics.metrics.avgCallDuration /= aggregateMetrics.jobs
      aggregateMetrics.metrics.costPerCall /= aggregateMetrics.jobs
      aggregateMetrics.metrics.completionTime /= aggregateMetrics.jobs
    }

    return aggregateMetrics
  }

  private calculateMetrics(job: Job): JobMetrics {
    const successRate = job.totalCalls > 0
      ? (job.completedCalls / job.totalCalls) * 100
      : 0

    // Calculate average call duration (mock data - replace with real duration tracking)
    const avgCallDuration = job.completedCalls > 0
      ? Math.random() * 5 + 2 // 2-7 minutes
      : 0

    // Calculate peak hours (mock data - replace with real timestamps)
    const peakHours = this.calculatePeakHours(job)

    // Calculate cost (mock data - replace with real cost tracking)
    const costPerCall = 0.05 // $0.05 per call
    const totalCost = job.completedCalls * costPerCall

    // Calculate completion time
    const completionTime = job.lastProcessedAt && job.schedule
      ? (job.lastProcessedAt.getTime() - job.schedule.getTime()) / (1000 * 60)
      : 0

    // Track failure reasons (mock data - replace with real error tracking)
    const failureReasons = new Map<string, number>([
      ['Invalid number', Math.floor(job.failedCalls * 0.3)],
      ['No answer', Math.floor(job.failedCalls * 0.4)],
      ['Network error', Math.floor(job.failedCalls * 0.2)],
      ['Other', Math.floor(job.failedCalls * 0.1)]
    ])

    return {
      successRate,
      avgCallDuration,
      peakHours,
      costPerCall,
      failureReasons,
      totalCost,
      completionTime
    }
  }

  private calculatePeakHours(job: Job): { hour: number; count: number }[] {
    // Mock data - replace with real timestamp analysis
    const hours: { hour: number; count: number }[] = []
    for (let i = 9; i <= 17; i++) {
      hours.push({
        hour: i,
        count: Math.floor(Math.random() * (job.completedCalls / 8))
      })
    }
    return hours.sort((a, b) => b.count - a.count)
  }

  private getEmptyMetrics(): JobMetrics {
    return {
      successRate: 0,
      avgCallDuration: 0,
      peakHours: [],
      costPerCall: 0,
      failureReasons: new Map(),
      totalCost: 0,
      completionTime: 0
    }
  }

  private aggregateMetrics(acc: JobMetrics, curr: JobMetrics): JobMetrics {
    // Combine peak hours
    const peakHours = [...acc.peakHours]
    curr.peakHours.forEach(({ hour, count }) => {
      const existing = peakHours.find(p => p.hour === hour)
      if (existing) {
        existing.count += count
      } else {
        peakHours.push({ hour, count })
      }
    })

    // Combine failure reasons
    const failureReasons = new Map(acc.failureReasons)
    curr.failureReasons.forEach((count, reason) => {
      failureReasons.set(reason, (failureReasons.get(reason) || 0) + count)
    })

    return {
      successRate: acc.successRate + curr.successRate,
      avgCallDuration: acc.avgCallDuration + curr.avgCallDuration,
      peakHours: peakHours.sort((a, b) => b.count - a.count),
      costPerCall: acc.costPerCall + curr.costPerCall,
      failureReasons,
      totalCost: acc.totalCost + curr.totalCost,
      completionTime: acc.completionTime + curr.completionTime
    }
  }
}
