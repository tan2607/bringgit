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
}

export const useUserManagement = () => {
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const search = ref('')

  const fetchUserData = async (params: FetchParams) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.search) queryParams.set('q', params.search)

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

  const { 
    data: userData,
    pending: loading,
    error,
    refresh: refreshUsers
  } = useAsyncData(
    'users',
    () => fetchUserData({ 
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: search.value 
    }),
    {
      watch: [currentPage, itemsPerPage, search]
    }
  )

  const users = computed(() => userData.value?.users || [])
  const total = computed(() => userData.value?.total || 0)
  const totalPages = computed(() => userData.value?.pages || 0)

  const fetchUsers = async (params?: FetchParams) => {
    if (params?.page) currentPage.value = params.page
    if (params?.limit) itemsPerPage.value = params.limit
    if (params?.search !== undefined) search.value = params.search
    await refreshUsers()
  }

  return {
    users,
    total,
    currentPage,
    itemsPerPage,
    totalPages,
    loading,
    error,
    fetchUsers
  }
}
