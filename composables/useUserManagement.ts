interface UserListResponse {
  success: boolean
  data: {
    users: any[]
    total: number
    page: number
    limit: number
    pages: number
  }
}

interface FetchParams {
  page?: number
  limit?: number
  search?: string
  includeSuperadmin?: boolean
}

export const useUserManagement = () => {
  const fetchUsers = async (params: FetchParams) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.search) queryParams.set('q', params.search)
    if (typeof params.includeSuperadmin === 'boolean') queryParams.set('includeSuperadmin', params.includeSuperadmin.toString())

    const response = await fetch(`/api/admin/users?${queryParams}`)
    const data: UserListResponse = await response.json()

    if (!data.success) {
      throw new Error('Failed to fetch users')
    }

    return {
      users: data.data.users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.app_metadata?.roles?.includes('admin') ? 'Admin' : 'User',
        assistants: user.app_metadata?.assistants || [],
        id: user.user_id
      })),
      total: data.data.total,
      page: data.data.page,
      limit: data.data.limit,
      pages: data.data.pages
    }
  }

  const updateUserAssistants = async (userId: string, assistants: string[]) => {
    return await fetch(`/api/admin/users/${userId}/assistant`, {
      method: 'PUT',
      body: JSON.stringify({ assistants }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    return await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return {
    fetchUsers,
    updateUserAssistants,
    updateUserRole
  }
}
