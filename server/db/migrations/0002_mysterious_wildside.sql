CREATE TABLE `share_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`token` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`email` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `share_tokens_token_unique` ON `share_tokens` (`token`);