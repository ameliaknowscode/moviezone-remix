CREATE TABLE "diary_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"watched_on" date NOT NULL,
	"rating" numeric(2, 1),
	"review" text,
	"contains_spoilers" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diary_entries_user_watched_idx" ON "diary_entries" USING btree ("user_id","watched_on");--> statement-breakpoint
CREATE INDEX "diary_entries_rewatch_idx" ON "diary_entries" USING btree ("user_id","movie_id","watched_on","created_at");