CREATE INDEX `idx_jobqueue_jobid_status_updatedat` ON `job_queue` (`job_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status_createdat` ON `jobs` (`status`,`created_at`);
ALTER TABLE `job_queue` ADD `max_retries` integer;--> statement-breakpoint
ALTER TABLE `jobs` ADD `max_retries` integer;