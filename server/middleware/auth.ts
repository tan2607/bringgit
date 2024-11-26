export default defineEventHandler((event) => {
  // Skip auth for non-voice endpoints
  if (!event.path.startsWith('/api/voice')) {
    return
  }

  const referer = getHeader(event, 'referer')
  const origin = getHeader(event, 'origin')
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Allow requests from next.keyreply.com or in development mode
  const isFromTrustedDomain = 
    (referer && referer.includes('next.keyreply.com')) || 
    (origin && origin.includes('next.keyreply.com')) ||
    isDevelopment

  if (isFromTrustedDomain) {
    return
  }

  // For other requests, require API token
  const token = getHeader(event, 'x-api-key')
  const configToken = process.env.API_TOKEN

  if (!configToken) {
    throw createError({
      statusCode: 500,
      message: 'API token not configured'
    })
  }

  if (!token || token !== configToken) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or missing API token'
    })
  }
})
