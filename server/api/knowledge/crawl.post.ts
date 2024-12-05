export default defineEventHandler(async (event) => {
  try {
    const { url } = await readBody(event)
    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'URL is required'
      })
    }

    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'FIRECRAWL_API_KEY is not configured'
      })
    }

    // Encode the URL properly
    const encodedUrl = encodeURIComponent(url)
    const apiUrl = `http://llmstxt.firecrawl.dev/${encodedUrl}/full?FIRECRAWL_API_KEY=${apiKey}`

    // Make the request with a long timeout
    const response = await $fetch(apiUrl, {
      timeout: 300000 // 5 minutes timeout
    })

    return { content: response }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to crawl website'
    })
  }
})
