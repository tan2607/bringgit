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

    // Get user's email domain and subdomain
    const userEmailDomain = user.email.split('@')[1]
    const subdomain = userEmailDomain.split('.')[0]

    // Build search query based on permissions
    let searchQuery = `app_metadata.permissions: ${subdomain}`

    if (user.isPermissionSuperAdmin()) {
      // Superadmins can see keyreply.com users
      searchQuery += ' OR app_metadata.permissions: superadmin'
    }

    // Add name and email search if provided
    if (search) {
      searchQuery += ` AND (name: *${search}* OR email: *${search}*)`
    }

    console.log(searchQuery)

    // Get users with pagination
    const users = await auth0Management.getUsers({
      q: searchQuery,
      page: page - 1,
      per_page: limit,
      include_totals: true,
      fields: 'user_id,email,name,picture,app_metadata,created_at,last_login',
      sort: 'name:1'
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
