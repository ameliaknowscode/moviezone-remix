CREATE TABLE "credit_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"is_crew" boolean DEFAULT false NOT NULL,
	CONSTRAINT "credit_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "credit_types_name_lower_unique" ON "credit_types" USING btree (lower("name"));