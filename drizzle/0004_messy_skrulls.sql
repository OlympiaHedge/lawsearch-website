CREATE TABLE `application_documents` (
	`object_key` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`filename` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_application_documents_application` ON `application_documents` (`application_id`);--> statement-breakpoint
CREATE TABLE `application_notifications` (
	`application_id` text PRIMARY KEY NOT NULL,
	`attempted_at` integer,
	`sent_at` integer,
	`last_error` text
);
