
import { auth0Management } from '@/lib/auth0'
import { H3Event } from 'h3'
import { AuthUser } from '@/server/utils/user'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await AuthUser.fromRequest(event)

    if (!user.isAdmin()) {
      return createError({
        statusCode: 403,
        message: 'Admin access required'
      })
    }

    if (event.method !== 'GET') {
      return createError({
        statusCode: 405,
        message: 'Method not allowed'
      })
    }

    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.q as string

    // Build search query
    const searchQuery = search ? { q: search } : undefined

    // Get users with pagination
    const users = await auth0Management.getUsers({
      ...searchQuery,
      page,
      per_page: limit,
      include_totals: true,
      fields: 'user_id,email,name,picture,app_metadata,user_metadata,created_at,last_login',
      sort: 'created_at:1'
    })

    return {
      success: true,
      data: {
        users: users.users,
        total: users.total,
        page,
        limit,
        pages: Math.ceil(users.total / limit)
      }
    }
  } catch (error) {
    console.error('Handler error:', error)
    return createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
