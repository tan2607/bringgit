import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.DATABASE_ACCOUNT_ID || '',
    databaseId: process.env.DATABASE_ID || '',
    token: process.env.DATABASE_TOKEN || '',
  }
})
