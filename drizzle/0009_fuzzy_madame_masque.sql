CREATE TABLE "credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"character" text,
	"ordering" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_type_id_credit_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."credit_types"("id") ON DELETE restrict ON UPDATE no action;