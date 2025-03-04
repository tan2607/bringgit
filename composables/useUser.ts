export const useUser = () => {
  const { session } = useAuth()

  const isAdmin = computed(() => {
    return session.value?.user?.app_metadata?.roles?.includes('admin') || false
  })

  const getAssistants = computed(() => {
    return session.value?.user?.app_metadata?.assistants || []
  })

  const hasPermission = (permission: string) => {
    return session.value?.user?.app_metadata?.permissions?.includes(permission) || false
  }

  const user = computed(() => session.value?.user)

  return {
    user,
    isAdmin,
    getAssistants,
    hasPermission
  }
}
