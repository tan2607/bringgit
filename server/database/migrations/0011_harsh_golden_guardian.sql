CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vapi_call_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`call_id` text NOT NULL,
	`assistant_id` text,
	`assistant_overrides` text,
	`bot_phone_number` text,
	`created_at` integer,
	`duration` text,
	`ended_at` integer,
	`ended_reason` text,
	`messages` text,
	`recording_url` text,
	`review` text,
	`started_at` integer,
	`status` text,
	`structured_data` text,
	`summary` text,
	`tags` text,
	`transcript` text
);
--> statement-breakpoint
CREATE INDEX `idx_vapicalldata_callid` ON `vapi_call_data` (`call_id`);--> statement-breakpoint
CREATE INDEX `idx_vapicalldata_createdat` ON `vapi_call_data` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_vapicalldata_assistant` ON `vapi_call_data` (`assistant_id`);