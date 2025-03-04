import { auth0Management } from '@/lib/auth0'
import { H3Event } from 'h3'
import { AuthUser } from '@/server/utils/user'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await AuthUser.fromRequest(event)

    if (!user.isAdmin()) {
      return createError({
        statusCode: 403,
        message: 'Unauthorized'
      })
    }

    if (event.method !== 'PUT') {
      return createError({
        statusCode: 405,
        message: 'Method not allowed'
      })
    }

    const userId = event.context.params?.userId
    const body = await readBody(event)
    const { assistants } = body

    if (!Array.isArray(assistants)) {
      return createError({
        statusCode: 400,
        message: 'Invalid assistants array'
      })
    }

    const updatedMetadata = await auth0Management.updateUserMetadata(
      userId as string,
      { assistants }
    )

    return {
      success: true,
      data: updatedMetadata
    }
  } catch (error) {
    console.error('Handler error:', error)
    return createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})