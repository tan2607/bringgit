import { db } from '../../database/index'
import { scheduledCalls } from '../../database/schema'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fromNumberId, toNumber, scheduledAt } = body

  try {
    const scheduleId = nanoid()

    await db.insert(scheduledCalls).values({
      id: scheduleId,
      numberId: fromNumberId,
      phoneNumber: toNumber,
      scheduledTime: new Date(scheduledAt),
      status: 'QUEUED',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return {
      success: true,
      scheduleId
    }
  } catch (error: any) {
    console.error('Failed to schedule call:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to schedule call'
    })
  }
})
