import { auth0Management } from '@@/lib/auth0'

export default defineEventHandler(async (event) => {
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
    const { botPhoneNumbers } = body

    if (!Array.isArray(botPhoneNumbers)) {
      return createError({
        statusCode: 400,
        message: 'Invalid bot phone numbers array'
      })
    }

    // Get the target user's current metadata
    const currentMetadata = await auth0Management.getUserMetadata(userId as string)

    // Only update the assistants field, preserving other metadata
    const updatedMetadata = await auth0Management.updateUserMetadata(
      userId as string,
      { 
        ...currentMetadata,
        botPhoneNumbers 
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
