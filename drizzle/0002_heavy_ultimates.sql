CREATE UNIQUE INDEX `idx_alert_subscription_preferences` ON `alert_subscriptions` (`email`,`role`,`area`);--> statement-breakpoint
CREATE INDEX `idx_alert_subscription_status` ON `alert_subscriptions` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_alert_confirm_hash` ON `alert_subscriptions` (`confirm_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_alert_unsubscribe_hash` ON `alert_subscriptions` (`unsubscribe_hash`);