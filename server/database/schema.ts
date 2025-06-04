import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'


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

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  name: text('name'),
  schedule: text('schedule').notNull(),
  status: text('status', {
    enum: ['pending', 'running', 'paused', 'completed', 'failed']
  }),
  progress: integer('progress'),
  totalCalls: integer('total_calls'),
  completedCalls: integer('completed_calls'),
  failedCalls: integer('failed_calls'),
  failedNumbers: text('failed_numbers'),
  phoneNumbers: text('phone_numbers'),
  names: text('names'),
  assistantId: text('assistant_id'),
  phoneNumberId: text('phone_number_id'),
  lastProcessedAt: text('last_processed_at'),
  notes: text('notes'),
  selectedTimeWindow: text('selected_time_window'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
}, (table) => {
  return {
    statusCreatedAtIdx: index('idx_jobs_status_createdat').on(
      table.status,
      table.createdAt
    )
  };
});

export const jobQueue = sqliteTable('job_queue', {
  id: text('id').primaryKey(),
  jobId: text('job_id').references(() => jobs.id),
  vapiId: text('vapi_id'),
  phoneNumber: text('phone_number').notNull(),
  name: text('name'),
  assistantId: text('assistant_id'),
  phoneNumberId: text('phone_number_id'),
  retryCount: integer('retry_count'),
  priority: integer('priority'),
  status: text('status', {
    enum: ['pending', 'running', 'completed', 'failed']
  }).notNull().default('pending'),
  delay: integer('delay'),
  scheduledAt: text('scheduled_at'),
  selectedTimeWindow: text('selected_time_window'),
  phoneNumbers: text('phone_numbers'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
}, (table) => {
  return {
    // Add index to improve filtering and sorting performance
    jobIdStatusUpdatedAtIdx: index('idx_jobqueue_jobid_status_updatedat').on(
      table.jobId,
      table.status,
      table.updatedAt
    )
  };
});

export const jobsRelations = relations(jobs, ({ many }) => ({
  jobQueues: many(jobQueue),
}));

export const jobQueueRelations = relations(jobQueue, ({ one }) => ({
  job: one(jobs, {
    fields: [jobQueue.jobId],
    references: [jobs.id],
  }),
}));

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
})

