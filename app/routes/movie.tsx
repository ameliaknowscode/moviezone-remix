import { Form, Link, redirect } from "react-router";
import { and, asc, eq } from "drizzle-orm";
import type { Route } from "./+types/movie";
import { auth } from "~/auth.server";
import { StarRating } from "~/components/star-rating";
import { db } from "~/db/client.server";
import {
  creditTypes as creditTypesTable,
  credits as creditsTable,
  genres as genresTable,
  movieGenres as movieGenresTable,
  movies as moviesTable,
  people as peopleTable,
  userMovieRating as userMovieRatingTable,
  watchlist as watchlistTable,
} from "~/db/schema";

const VALID_RATINGS = new Set([
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5",
]);

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? data.movie.title : "Movie" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const [movie] = await db
    .select()
    .from(moviesTable)
    .where(eq(moviesTable.slug, params.slug))
    .limit(1);

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user.id ?? null;

  const [movieGenresList, movieCreditsList, watchlistRow, ratingRow] =
    await Promise.all([
    db
      .select({
        id: genresTable.id,
        name: genresTable.name,
        slug: genresTable.slug,
      })
      .from(movieGenresTable)
      .innerJoin(genresTable, eq(movieGenresTable.genreId, genresTable.id))
      .where(eq(movieGenresTable.movieId, movie.id))
      .orderBy(asc(genresTable.name)),
    db
      .select({
        id: creditsTable.id,
        character: creditsTable.character,
        ordering: creditsTable.ordering,
        personId: peopleTable.id,
        personName: peopleTable.name,
        personSlug: peopleTable.slug,
        typeId: creditTypesTable.id,
        typeName: creditTypesTable.name,
        typeIsCrew: creditTypesTable.isCrew,
      })
      .from(creditsTable)
      .innerJoin(peopleTable, eq(creditsTable.personId, peopleTable.id))
      .innerJoin(
        creditTypesTable,
        eq(creditsTable.typeId, creditTypesTable.id),
      )
      .where(eq(creditsTable.movieId, movie.id))
      .orderBy(asc(creditsTable.ordering)),
    userId
      ? db
          .select({ userId: watchlistTable.userId })
          .from(watchlistTable)
          .where(
            and(
              eq(watchlistTable.userId, userId),
              eq(watchlistTable.movieId, movie.id),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
    userId
      ? db
          .select({ rating: userMovieRatingTable.rating })
          .from(userMovieRatingTable)
          .where(
            and(
              eq(userMovieRatingTable.userId, userId),
              eq(userMovieRatingTable.movieId, movie.id),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
    ]);

  const cast = movieCreditsList.filter((c) => !c.typeIsCrew);
  const crew = movieCreditsList.filter((c) => c.typeIsCrew);

  return {
    movie,
    genres: movieGenresList,
    cast,
    crew,
    isSignedIn: userId !== null,
    onWatchlist: watchlistRow.length > 0,
    rating: ratingRow[0] ? parseFloat(ratingRow[0].rating) : null,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const [movie] = await db
    .select({ id: moviesTable.id })
    .from(moviesTable)
    .where(eq(moviesTable.slug, params.slug))
    .limit(1);

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "watchlist-add") {
    await db
      .insert(watchlistTable)
      .values({ userId: session.user.id, movieId: movie.id })
      .onConflictDoNothing();
    return null;
  }

  if (intent === "watchlist-remove") {
    await db
      .delete(watchlistTable)
      .where(
        and(
          eq(watchlistTable.userId, session.user.id),
          eq(watchlistTable.movieId, movie.id),
        ),
      );
    return null;
  }

  if (intent === "rating-set") {
    const rating = formData.get("rating");
    if (typeof rating !== "string" || !VALID_RATINGS.has(rating)) {
      throw new Response("Bad Request", { status: 400 });
    }
    await db
      .insert(userMovieRatingTable)
      .values({
        userId: session.user.id,
        movieId: movie.id,
        rating,
      })
      .onConflictDoUpdate({
        target: [userMovieRatingTable.userId, userMovieRatingTable.movieId],
        set: { rating, updatedAt: new Date() },
      });
    return null;
  }

  if (intent === "rating-clear") {
    await db
      .delete(userMovieRatingTable)
      .where(
        and(
          eq(userMovieRatingTable.userId, session.user.id),
          eq(userMovieRatingTable.movieId, movie.id),
        ),
      );
    return null;
  }

  throw new Response("Bad Request", { status: 400 });
}

export default function Movie({ loaderData }: Route.ComponentProps) {
  const { movie, genres, cast, crew, isSignedIn, onWatchlist, rating } =
    loaderData;

  return (
    <main className="p-8 max-w-xl">
      <Link to="/movies" className="text-sm text-gray-500 hover:underline">
        ← Back to movies
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">
        {movie.title}{" "}
        <span className="text-gray-500 font-normal">({movie.year})</span>
      </h1>

      {isSignedIn && (
        <div className="mb-4 space-y-2">
          <StarRating current={rating} />
          <Form method="post">
            <input
              type="hidden"
              name="intent"
              value={onWatchlist ? "watchlist-remove" : "watchlist-add"}
            />
            <button
              type="submit"
              className={
                onWatchlist
                  ? "text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
                  : "text-sm bg-black text-white rounded px-3 py-1 hover:bg-gray-800"
              }
            >
              {onWatchlist ? "✓ On watchlist" : "+ Watchlist"}
            </button>
          </Form>
        </div>
      )}

      {(movie.runtime || movie.country || movie.language) && (
        <p className="text-sm text-gray-600 mb-4">
          {[
            movie.runtime ? `${movie.runtime} min` : null,
            movie.country,
            movie.language,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      {genres.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <li
              key={genre.id}
              className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1"
            >
              {genre.name}
            </li>
          ))}
        </ul>
      )}

      {movie.synopsis && (
        <section className="mb-4">
          <h2 className="font-semibold text-sm mb-1">Synopsis</h2>
          <p className="text-gray-800">{movie.synopsis}</p>
        </section>
      )}

      {cast.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-sm mb-1">Cast</h2>
          <ul className="space-y-0.5 text-sm">
            {cast.map((credit) => (
              <li key={credit.id}>
                <span className="text-gray-900">{credit.personName}</span>
                {credit.character && (
                  <span className="text-gray-500"> as {credit.character}</span>
                )}
                <span className="text-gray-500"> · {credit.typeName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {crew.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-sm mb-1">Crew</h2>
          <ul className="space-y-0.5 text-sm">
            {crew.map((credit) => (
              <li key={credit.id}>
                <span className="text-gray-900">{credit.personName}</span>
                <span className="text-gray-500"> · {credit.typeName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(movie.imdbId || movie.letterboxdSlug) && (
        <section className="mb-6 flex gap-3 text-sm">
          {movie.imdbId && (
            <a
              href={`https://www.imdb.com/title/${movie.imdbId}/`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              IMDb
            </a>
          )}
          {movie.letterboxdSlug && (
            <a
              href={`https://letterboxd.com/film/${movie.letterboxdSlug}/`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Letterboxd
            </a>
          )}
        </section>
      )}
    </main>
  );
}
