export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Phone number ID is required'
      })
    }

    console.log('[Numbers Deletion] Starting deletion process for:', id)

    // Step 1: Get phone number details to get credential ID
    console.log('[Numbers Deletion] Step 1: Fetching phone number details...')
    const phoneNumberResponse = await $fetch(`https://api.vapi.ai/phone-number/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // Step 2: Delete phone number
    console.log('[Numbers Deletion] Step 2: Deleting phone number...')
    await $fetch(`https://api.vapi.ai/phone-number/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${config.vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // Step 3: Delete associated credential if exists
    if (phoneNumberResponse.credentialId) {
      console.log('[Numbers Deletion] Step 3: Deleting associated credential...')
      await $fetch(`https://api.vapi.ai/credential/${phoneNumberResponse.credentialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.vapiApiKey}`,
          'Content-Type': 'application/json'
        }
      })
    }

    return {
      success: true,
      message: 'Phone number and associated credential deleted successfully'
    }
  } catch (error: any) {
    console.error('[Numbers Deletion] Error:', error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete phone number'
    })
  }
})
