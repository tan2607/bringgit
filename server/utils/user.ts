import { H3Event } from 'h3'
import { getServerSession } from '#auth'
import { authOptions } from '@/server/api/auth/[...]'
import { AppMetadata, DEFAULT_APP_METADATA } from '@/types/auth'

export class AuthUser {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string,
        public readonly auth0Id: string,
        public readonly app_metadata: AppMetadata = DEFAULT_APP_METADATA
    ) {}

    isAdmin(): boolean {
        return this.app_metadata?.roles?.includes('admin') || false
    }

    isPermissionSuperAdmin(): boolean {
        return this.app_metadata?.permissions?.includes('superadmin') || false
    }

    getAssistants(): string[] {
        return this.app_metadata?.assistants || []
    }

    hasPermission(permission: string): boolean {
        return this.app_metadata?.permissions?.includes(permission) || false
    }

    getBotPhoneNumbers(): string[] {
        return this.app_metadata?.botPhoneNumbers || []
    }

    static async fromRequest(event: H3Event): Promise<AuthUser> {
        const session = await getServerSession(event, authOptions)
        if (!session?.user) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized'
            })
        }

        return new AuthUser(
            session.user.id,
            session.user.email,
            session.user.name,
            session.user.auth0Id,
            session.user.app_metadata || DEFAULT_APP_METADATA
        )
    }
}
