CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`sector` text NOT NULL,
	`location` text NOT NULL,
	`job_id` text NOT NULL,
	`message` text NOT NULL,
	`filename` text NOT NULL,
	`object_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`consent_version` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submission_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
