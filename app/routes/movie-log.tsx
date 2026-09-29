import { Form, Link, redirect } from "react-router";
import { and, eq } from "drizzle-orm";
import type { Route } from "./+types/movie-log";
import { DiaryEntryFields } from "~/components/diary-entry-fields";
import { db } from "~/db/client.server";
import {
  diaryEntries as diaryEntriesTable,
  movies as moviesTable,
  userMovieRating as userMovieRatingTable,
  watchlist as watchlistTable,
} from "~/db/schema";
import { parseDiaryEntryForm, todayIso } from "~/lib/diary";
import { requireUser } from "~/lib/require-user.server";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `Log ${data.movie.title}` : "Log a watch" }];
}

async function findMovie(slug: string) {
  const [movie] = await db
    .select({
      id: moviesTable.id,
      title: moviesTable.title,
      year: moviesTable.year,
      slug: moviesTable.slug,
    })
    .from(moviesTable)
    .where(eq(moviesTable.slug, slug))
    .limit(1);

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }
  return movie;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const movie = await findMovie(params.slug);

  // Pre-fill the picker with the user's current rating for this movie.
  const [ratingRow] = await db
    .select({ rating: userMovieRatingTable.rating })
    .from(userMovieRatingTable)
    .where(
      and(
        eq(userMovieRatingTable.userId, user.id),
        eq(userMovieRatingTable.movieId, movie.id),
      ),
    )
    .limit(1);

  return {
    movie,
    today: todayIso(),
    currentRating: ratingRow ? parseFloat(ratingRow.rating) : null,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const movie = await findMovie(params.slug);

  const parsed = parseDiaryEntryForm(await request.formData());
  if (!parsed.ok) {
    return { errors: parsed.errors, values: parsed.values };
  }
  const entry = parsed.data;

  await db.transaction(async (tx) => {
    await tx.insert(diaryEntriesTable).values({
      userId: user.id,
      movieId: movie.id,
      ...entry,
    });

    // The per-entry rating is history; user_movie_rating is "what I think
    // of this film now", so logging with a rating writes through to it.
    if (entry.rating !== null) {
      await tx
        .insert(userMovieRatingTable)
        .values({ userId: user.id, movieId: movie.id, rating: entry.rating })
        .onConflictDoUpdate({
          target: [userMovieRatingTable.userId, userMovieRatingTable.movieId],
          set: { rating: entry.rating, updatedAt: new Date() },
        });
    }

    // Watched it, so it's no longer on the watchlist.
    await tx
      .delete(watchlistTable)
      .where(
        and(
          eq(watchlistTable.userId, user.id),
          eq(watchlistTable.movieId, movie.id),
        ),
      );
  });

  return redirect(`/movies/${movie.slug}`);
}

export default function MovieLog({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { movie, today, currentRating } = loaderData;
  const values = actionData?.values ?? {
    watchedOn: today,
    rating: currentRating,
    review: "",
    containsSpoilers: false,
  };

  return (
    <main className="p-8 max-w-xl">
      <Link
        to={`/movies/${movie.slug}`}
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to {movie.title}
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">
        Log {movie.title}{" "}
        <span className="text-gray-500 font-normal">({movie.year})</span>
      </h1>

      <Form method="post" className="space-y-3">
        <DiaryEntryFields
          values={values}
          errors={actionData?.errors}
          maxDate={today}
        />
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Save
        </button>
      </Form>
    </main>
  );
}
