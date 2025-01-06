import { drizzle } from 'drizzle-orm/d1'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:./data.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
})

export const db = drizzle(client, { schema })
