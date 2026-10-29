CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`player` text NOT NULL,
	`started` integer NOT NULL,
	`finished` integer,
	`nickname` text,
	`score` integer,
	`distance` integer,
	`jobs` integer,
	`mode` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `score_idx` ON `runs` (`score`);--> statement-breakpoint
CREATE INDEX `finished_idx` ON `runs` (`finished`);