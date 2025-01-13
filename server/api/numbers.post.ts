export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { name, phoneNumber, username, password, domain, protocol, port } = body
    const DEFAULT_PORT = 5060

    console.log('[Numbers Registration] Starting registration process:', { name, phoneNumber, domain, protocol, port })

    if (!name || !phoneNumber || !domain || !protocol) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields'
      })
    }

    // Step 1: Create credential
    console.log('[Numbers Registration] Step 1: Creating SIP credential...')
    const credentialResponse = await $fetch('https://api.vapi.ai/credential', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        provider: 'byo-sip-trunk',
        gateways: [
          {
            ip: domain,
            port: Number(port) || DEFAULT_PORT,
            inboundEnabled: false,
            outboundEnabled: true,
            outboundProtocol: protocol
          }
        ],
        name: `${name} SIP Credentials`,
        ...(username && password ? {
          outboundAuthenticationPlan: {
            authUsername: username,
            authPassword: password
          }
        } : {})
      }
    })
    console.log('[Numbers Registration] Credential created successfully:', credentialResponse.id)

    // Step 2: Register phone number with credential
    console.log('[Numbers Registration] Step 2: Registering phone number...')
    const numberResponse = await $fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        number: phoneNumber,
        name,
        credentialId: credentialResponse.id,
        provider: 'byo-phone-number',
        numberE164CheckEnabled: true
      }
    })
    console.log('[Numbers Registration] Phone number registered successfully:', numberResponse)

    return {
      success: true,
      credential: credentialResponse,
      number: numberResponse
    }
  } catch (error: any) {
    console.error('[Numbers Registration] Error:', error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to register phone number'
    })
  }
})
