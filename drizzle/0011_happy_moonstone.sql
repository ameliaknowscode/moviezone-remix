CREATE TABLE "user_movie_rating" (
	"user_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_movie_rating_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "user_movie_rating" ADD CONSTRAINT "user_movie_rating_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_movie_rating" ADD CONSTRAINT "user_movie_rating_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;