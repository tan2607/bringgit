import { auth0Management } from '@@/lib/auth0'
import { H3Event } from 'h3'
import { AuthUser } from '@@/server/utils/user'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await AuthUser.fromRequest(event)
    if (event.method !== 'POST') {
      return createError({
        statusCode: 405,
        message: 'Method not allowed'
      })
    }

    const userId = user.auth0Id
    const body = await readBody(event)
    const { name, email, phoneNumber } = body

    // Get the target user's current metadata
    const currentMetadata = await auth0Management.getUserMetadata(userId as string)

    // Update the roles field while preserving other metadata
    const updatedMetadata = await auth0Management.updateUserMetadata(
      userId as string,
      { 
        ...currentMetadata,
        notifPhone: phoneNumber,
      }
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
