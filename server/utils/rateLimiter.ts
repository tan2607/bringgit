export interface RateLimitConfig {
  maxConcurrentCallsPerJob: number;
  maxGlobalConcurrentCalls: number;
}

export class RateLimiter {
  private activeJobCalls: Map<string, number>;
  private totalActiveCalls: number;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.activeJobCalls = new Map();
    this.totalActiveCalls = 0;
    this.config = config;
  }

  async acquireJobSlot(jobId: string): Promise<boolean> {
    const currentJobCalls = this.activeJobCalls.get(jobId) || 0;

    // Check job-level limit
    if (currentJobCalls >= this.config.maxConcurrentCallsPerJob) {
      console.log(`Job ${jobId} at max concurrent calls (${currentJobCalls})`);
      return false;
    }

    // Check global limit
    if (this.totalActiveCalls >= this.config.maxGlobalConcurrentCalls) {
      console.log(`System at max concurrent calls (${this.totalActiveCalls})`);
      return false;
    }

    // Increment counters
    this.activeJobCalls.set(jobId, currentJobCalls + 1);
    this.totalActiveCalls++;

    return true;
  }

  async releaseJobSlot(jobId: string): Promise<void> {
    const currentJobCalls = this.activeJobCalls.get(jobId) || 0;
    
    if (currentJobCalls > 0) {
      this.activeJobCalls.set(jobId, currentJobCalls - 1);
      this.totalActiveCalls--;
    }

    // Clean up if job has no active calls
    if (currentJobCalls <= 1) {
      this.activeJobCalls.delete(jobId);
    }
  }

  getCurrentJobCalls(jobId: string): number {
    return this.activeJobCalls.get(jobId) || 0;
  }

  getTotalActiveCalls(): number {
    return this.totalActiveCalls;
  }

  isJobAtLimit(jobId: string): boolean {
    const currentJobCalls = this.activeJobCalls.get(jobId) || 0;
    return currentJobCalls >= this.config.maxConcurrentCallsPerJob;
  }

  isGlobalAtLimit(): boolean {
    return this.totalActiveCalls >= this.config.maxGlobalConcurrentCalls;
  }
}
