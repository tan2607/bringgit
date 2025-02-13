import { jobs } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, name, schedule, phoneNumbers, assistantId, phoneNumberId, totalCalls } = body

  try {
    const db = useDrizzle();
    await db.insert(jobs).values({
      id,
      name,
      schedule,
      phoneNumbers: JSON.stringify(phoneNumbers),
      assistantId,
      phoneNumberId,
      status: 'pending',
      progress: 0,
      completedCalls: 0,
      totalCalls
    })

    return {
      success: true,
      message: 'Job created successfully'
    }
  } catch (error: any) {
    console.error('Failed to create job:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create job'
    })
  }
})