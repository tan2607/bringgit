export type UserRole = 'admin' | 'user'

export interface AppMetadata {
  permissions: string[]
  roles: UserRole[]
  assistants: string[]
  botPhoneNumbers: string[]
  notifPhone: string
}

export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    auth0Id: string
    app_metadata: AppMetadata
  }
  error?: string
}

export const DEFAULT_APP_METADATA: AppMetadata = {
  permissions: [],
  roles: ['user'],
  assistants: [],
  botPhoneNumbers: []
}