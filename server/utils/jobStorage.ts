import { D1Database } from '@cloudflare/workers-types'

export interface JobHistoryEntry {
  jobId: string
  timestamp: Date
  status: JobStatus
  completedCalls: number
  failedCalls: number
  message?: string
}

export interface JobStatus {
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  completedCalls: number
  failedCalls: number
  failedNumbers: string[]
  lastProcessedAt: Date
  lastError?: string
}

export class JobStorage {
  constructor(private db: D1Database) {}

  async initializeTables() {
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        schedule TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER NOT NULL,
        totalCalls INTEGER NOT NULL,
        completedCalls INTEGER NOT NULL,
        failedCalls INTEGER NOT NULL,
        failedNumbers TEXT,
        phoneNumbers TEXT NOT NULL,
        assistantId TEXT NOT NULL,
        phoneNumberId TEXT NOT NULL,
        lastProcessedAt TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `).run()

    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS job_history (
        id TEXT PRIMARY KEY,
        jobId TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL,
        completedCalls INTEGER NOT NULL,
        failedCalls INTEGER NOT NULL,
        message TEXT,
        FOREIGN KEY(jobId) REFERENCES jobs(id)
      )
    `).run()
  }

  async saveJob(job: Job): Promise<void> {
    const now = new Date().toISOString()
    await this.db.prepare(`
      INSERT INTO jobs (
        id, name, schedule, status, progress, totalCalls,
        completedCalls, failedCalls, failedNumbers, phoneNumbers,
        assistantId, phoneNumberId, lastProcessedAt, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      job.id,
      job.name,
      job.schedule.toISOString(),
      job.status,
      job.progress,
      job.totalCalls,
      job.completedCalls,
      job.failedCalls || 0,
      JSON.stringify(job.failedNumbers || []),
      JSON.stringify(job.phoneNumbers),
      job.assistantId,
      job.phoneNumberId,
      job.lastProcessedAt?.toISOString() || null,
      job.notes || null,
      now,
      now
    ).run()
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
    const now = new Date().toISOString()
    await this.db.prepare(`
      UPDATE jobs SET
        status = ?,
        progress = ?,
        completedCalls = ?,
        failedCalls = ?,
        failedNumbers = ?,
        lastProcessedAt = ?,
        updatedAt = ?
      WHERE id = ?
    `).bind(
      status.status,
      status.progress,
      status.completedCalls,
      status.failedCalls,
      JSON.stringify(status.failedNumbers),
      status.lastProcessedAt.toISOString(),
      now,
      jobId
    ).run()

    // Add history entry
    await this.addHistoryEntry({
      jobId,
      timestamp: new Date(),
      status: status.status,
      completedCalls: status.completedCalls,
      failedCalls: status.failedCalls,
      message: status.lastError
    })
  }

  async getJob(jobId: string): Promise<Job | null> {
    const result = await this.db.prepare(
      'SELECT * FROM jobs WHERE id = ?'
    ).bind(jobId).first()
    
    if (!result) return null
    
    return {
      ...result,
      schedule: new Date(result.schedule),
      phoneNumbers: JSON.parse(result.phoneNumbers),
      failedNumbers: JSON.parse(result.failedNumbers || '[]'),
      lastProcessedAt: result.lastProcessedAt ? new Date(result.lastProcessedAt) : null
    }
  }

  async getJobHistory(jobId: string): Promise<JobHistoryEntry[]> {
    const results = await this.db.prepare(
      'SELECT * FROM job_history WHERE jobId = ? ORDER BY timestamp DESC'
    ).bind(jobId).all()
    
    return results.results.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }))
  }

  private async addHistoryEntry(entry: JobHistoryEntry): Promise<void> {
    await this.db.prepare(`
      INSERT INTO job_history (
        id, jobId, timestamp, status, completedCalls, failedCalls, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      entry.jobId,
      entry.timestamp.toISOString(),
      entry.status,
      entry.completedCalls,
      entry.failedCalls,
      entry.message || null
    ).run()
  }
}
