CREATE TABLE `call_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`call_id` integer,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`call_id`) REFERENCES `calls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `calls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`direction` text NOT NULL,
	`status` text NOT NULL,
	`phone_number` text NOT NULL,
	`duration` real,
	`recording_url` text,
	`transcript_url` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `job_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`phone_number` text NOT NULL,
	`assistant_id` text,
	`phone_number_id` text,
	`retry_count` integer,
	`priority` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`schedule` text NOT NULL,
	`status` text,
	`progress` integer,
	`total_calls` integer,
	`completed_calls` integer,
	`failed_calls` integer,
	`failed_numbers` text,
	`phone_numbers` text,
	`assistant_id` text,
	`phone_number_id` text,
	`last_processed_at` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduled_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`phone_number` text NOT NULL,
	`name` text,
	`notes` text,
	`scheduled_time` integer NOT NULL,
	`status` text DEFAULT 'QUEUED' NOT NULL,
	`assistant_id` text NOT NULL,
	`number_id` text NOT NULL,
	`call_id` text,
	`transcript` text,
	`duration` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);