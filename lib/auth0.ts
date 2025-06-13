import { DEFAULT_APP_METADATA, type AppMetadata } from "@@/types/auth"

export class Auth0ManagementClient {
    private accessToken: string | null = null
    private tokenExpiresAt: number = 0
    private auth0Config = useRuntimeConfig().auth0 || {}

    async refreshTokenIfNeeded(): Promise<void> {
        const BUFFER_TIME = 60 * 1000
        if (this.accessToken && Date.now() < this.tokenExpiresAt - BUFFER_TIME) {
            return
        }

        try {
            const response = await fetch(`https://${this.auth0Config.domain}/oauth/token`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    client_id: this.auth0Config.clientId,
                    client_secret: this.auth0Config.clientSecret,
                    audience: this.auth0Config.audience,
                    grant_type: 'client_credentials',
                    scope: 'read:users update:users update:users_app_metadata'
                })
            })

            if (!response.ok) {
                const error = await response.json()
                console.error('Token response error:', error)
                throw new Error(`Auth0 token error: ${JSON.stringify(error)}`)
            }

            const data = await response.json()

            this.accessToken = data.access_token
            this.tokenExpiresAt = Date.now() + (data.expires_in * 1000)
        } catch (error) {
            console.error('Failed to refresh Auth0 management token:', error)
            throw new Error('Authentication service unavailable')
        }
    }

    async getUserMetadata(userId: string): Promise<AppMetadata> {
        try {
            await this.refreshTokenIfNeeded()
            
            // Format user ID for Auth0 Management API
            const formattedUserId = encodeURIComponent(`auth0|${userId}`)

            const response = await fetch(
                `https://${this.auth0Config.domain}/api/v2/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                const error = await response.json()
                console.error('User metadata response error:', error)
                throw new Error(`Auth0 API error: ${JSON.stringify(error)}`)
            }

            const user = await response.json()
            return user.app_metadata || DEFAULT_APP_METADATA
        } catch (error) {
            console.error('Failed to get user metadata:', error)
            throw error
        }
    }

    async getUsers(params: { 
        page?: number; 
        per_page?: number; 
        q?: string; 
        include_totals?: boolean;
        fields?: string;
        sort?: string;
    }) {
        try {
            await this.refreshTokenIfNeeded()

            const queryParams = new URLSearchParams()
            if (params.page) queryParams.set('page', params.page.toString())
            if (params.per_page) queryParams.set('per_page', params.per_page.toString())
            if (params.q) queryParams.set('q', params.q)
            if (params.include_totals) queryParams.set('include_totals', params.include_totals.toString())
            if (params.fields) queryParams.set('fields', params.fields)
            if (params.sort) queryParams.set('sort', params.sort)

            const response = await fetch(
                `https://${this.auth0Config.domain}/api/v2/users?${queryParams}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                throw new Error('Failed to get users')
            }

            return response.json()
        } catch (error) {
            console.error('Failed to get users:', error)
            throw error
        }
    }

    async updateUserMetadata(userId: string, metadata: Partial<AppMetadata>): Promise<AppMetadata> {
        await this.refreshTokenIfNeeded()
        
        // Format user ID for Auth0 Management API
        const formattedUserId = encodeURIComponent(`auth0|${userId}`)
        
        const response = await fetch(
            `https://${this.auth0Config.domain}/api/v2/users/${userId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    app_metadata: metadata
                })
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Failed to update user metadata: ${JSON.stringify(error)}`)
        }

        const user = await response.json()
        return user.app_metadata
    }
}

export const auth0Management = new Auth0ManagementClient()