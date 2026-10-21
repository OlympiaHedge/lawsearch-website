CREATE TABLE `alert_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`job_id` text NOT NULL,
	`sent_at` integer,
	`attempted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `alert_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`area` text NOT NULL,
	`status` text NOT NULL,
	`confirm_hash` text NOT NULL,
	`unsubscribe_hash` text NOT NULL,
	`unsubscribe_token` text NOT NULL,
	`baseline` text NOT NULL,
	`created_at` integer NOT NULL,
	`confirmed_at` integer,
	`last_confirmation` integer NOT NULL
);
