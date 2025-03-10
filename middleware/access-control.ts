import { useUser } from '~/composables/useUser'

// Routes that only admins can access
const ADMIN_ROUTES = [
  '/assistants',
  '/analytics',
  '/scheduling',
  '/numbers',
  '/demo',
  '/settings',
  '/access-control'
]

// Routes that all authenticated users can access
const USER_ROUTES = [
  '/',
  '/calls'
]

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAdmin } = useUser()
  
  // Always allow auth routes
  if (to.path.startsWith('/auth')) {
    return
  }

  // Check if route requires admin
  const isAdminRoute = ADMIN_ROUTES.some(route => to.path.startsWith(route))
  
  if (isAdminRoute && !isAdmin.value) {
    // If user is not admin and tries to access admin route, redirect to home
    return navigateTo('/')
  }

  // For non-admin routes, ensure it's in the allowed list
  if (!isAdminRoute && !USER_ROUTES.some(route => to.path.startsWith(route))) {
    return navigateTo('/')
  }
})
