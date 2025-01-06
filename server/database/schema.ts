import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const calls = sqliteTable('calls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  direction: text('direction', { enum: ['inbound', 'outbound'] }).notNull(),
  status: text('status', { enum: ['pending', 'in-progress', 'completed', 'failed'] }).notNull(),
  phoneNumber: text('phone_number').notNull(),
  duration: real('duration'),
  recordingUrl: text('recording_url'),
  transcriptUrl: text('transcript_url'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const callTags = sqliteTable('call_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  callId: integer('call_id').references(() => calls.id),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const scheduledCalls = sqliteTable('scheduled_calls', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  phoneNumber: text('phone_number').notNull(),
  name: text('name'),
  notes: text('notes'),
  scheduledTime: integer('scheduled_time', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['QUEUED', 'RINGING', 'IN_PROGRESS', 'FORWARDED', 'ENDED'] }).notNull().default('QUEUED'),
  assistantId: text('assistant_id').notNull(),
  numberId: text('number_id').notNull(),
  callId: text('call_id'),
  transcript: text('transcript'),
  duration: integer('duration'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})
