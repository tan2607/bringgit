PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_job_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`phone_number` text NOT NULL,
	`assistant_id` text,
	`phone_number_id` text,
	`retry_count` integer,
	`priority` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`delay` integer,
	`scheduled_at` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_job_queue`("id", "job_id", "phone_number", "assistant_id", "phone_number_id", "retry_count", "priority", "status", "delay", "scheduled_at", "created_at", "updated_at") SELECT "id", "job_id", "phone_number", "assistant_id", "phone_number_id", "retry_count", "priority", "status", "delay", "scheduled_at", "created_at", "updated_at" FROM `job_queue`;--> statement-breakpoint
DROP TABLE `job_queue`;--> statement-breakpoint
ALTER TABLE `__new_job_queue` RENAME TO `job_queue`;--> statement-breakpoint
PRAGMA foreign_keys=ON;