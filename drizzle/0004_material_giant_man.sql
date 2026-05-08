ALTER TABLE "movies" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "synopsis" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "runtime" integer;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "imdb_id" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "letterboxd_slug" text;--> statement-breakpoint
UPDATE "movies" SET "slug" = trim(both '-' from lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'))) || '-' || "year"::text WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_slug_unique" UNIQUE("slug");