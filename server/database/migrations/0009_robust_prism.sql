CREATE INDEX `idx_jobqueue_jobid_status_updatedat` ON `job_queue` (`job_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status_createdat` ON `jobs` (`status`,`created_at`);