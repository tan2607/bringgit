export default defineEventHandler(async (event) => {
  const queueHandler = event.context.queueHandler as any
  const rateLimiter = queueHandler?.rateLimiter

  if (!rateLimiter) {
    throw new Error('Rate limiter not initialized')
  }

  return {
    totalActiveCalls: rateLimiter.getTotalActiveCalls(),
    isGlobalLimitReached: rateLimiter.isGlobalAtLimit(),
    activeJobs: Array.from(rateLimiter.activeJobCalls.entries()).map(([jobId, calls]) => ({
      jobId,
      activeCalls: calls,
      isAtLimit: rateLimiter.isJobAtLimit(jobId)
    })),
    limits: {
      maxConcurrentCallsPerJob: rateLimiter.config.maxConcurrentCallsPerJob,
      maxGlobalConcurrentCalls: rateLimiter.config.maxGlobalConcurrentCalls
    }
  }
})
