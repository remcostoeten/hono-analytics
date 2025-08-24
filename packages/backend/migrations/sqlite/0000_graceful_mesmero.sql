CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`action` text,
	`label` text,
	`value` real,
	`properties` text,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `events_session_id_idx` ON `events` (`session_id`);--> statement-breakpoint
CREATE INDEX `events_name_idx` ON `events` (`name`);--> statement-breakpoint
CREATE INDEX `events_timestamp_idx` ON `events` (`timestamp`);--> statement-breakpoint
CREATE TABLE `pageviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`url` text NOT NULL,
	`path` text NOT NULL,
	`query_params` text,
	`hash` text,
	`title` text,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`time_on_page` integer,
	`scroll_depth` integer,
	`clicks` integer DEFAULT 0 NOT NULL,
	`is_exit` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pageviews_session_id_idx` ON `pageviews` (`session_id`);--> statement-breakpoint
CREATE INDEX `pageviews_timestamp_idx` ON `pageviews` (`timestamp`);--> statement-breakpoint
CREATE INDEX `pageviews_path_idx` ON `pageviews` (`path`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`api_key` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_api_key_unique` ON `projects` (`api_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_api_key_idx` ON `projects` (`api_key`);--> statement-breakpoint
CREATE INDEX `projects_domain_idx` ON `projects` (`domain`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`user_id` text NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`ended_at` integer,
	`duration` integer,
	`page_count` integer DEFAULT 0 NOT NULL,
	`referrer` text,
	`referrer_domain` text,
	`landing_page` text,
	`exit_page` text,
	`origin` text,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_term` text,
	`utm_content` text,
	`device_type` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_started_at_idx` ON `sessions` (`started_at`);--> statement-breakpoint
CREATE INDEX `sessions_ended_at_idx` ON `sessions` (`ended_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`project_id` integer NOT NULL,
	`fingerprint` text,
	`first_seen` integer DEFAULT (unixepoch()) NOT NULL,
	`last_seen` integer DEFAULT (unixepoch()) NOT NULL,
	`device` text,
	`browser` text,
	`browser_version` text,
	`os` text,
	`os_version` text,
	`country` text,
	`region` text,
	`city` text,
	`lat` real,
	`lng` real,
	`timezone` text,
	`language` text,
	`is_dev` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `users_project_id_idx` ON `users` (`project_id`);--> statement-breakpoint
CREATE INDEX `users_fingerprint_idx` ON `users` (`fingerprint`);--> statement-breakpoint
CREATE INDEX `users_last_seen_idx` ON `users` (`last_seen`);