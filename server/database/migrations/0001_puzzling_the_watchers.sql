ALTER TABLE `job_queue` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `job_queue` ADD `delay` integer;