import { drizzle } from 'drizzle-orm/d1'
export { sql, eq, and, or, desc, asc } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

// Type exports for better TypeScript support
export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert

export type Call = typeof schema.calls.$inferSelect
export type NewCall = typeof schema.calls.$inferInsert

export type CallTag = typeof schema.callTags.$inferSelect
export type NewCallTag = typeof schema.callTags.$inferInsert
