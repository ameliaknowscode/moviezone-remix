import { Link } from "react-router";
import { asc, eq } from "drizzle-orm";
import type { Route } from "./+types/movie";
import { db } from "~/db/client.server";
import {
  genres as genresTable,
  movieGenres as movieGenresTable,
  movies as moviesTable,
} from "~/db/schema";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? data.movie.title : "Movie" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const [movie] = await db
    .select()
    .from(moviesTable)
    .where(eq(moviesTable.slug, params.slug))
    .limit(1);

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }

  const movieGenresList = await db
    .select({
      id: genresTable.id,
      name: genresTable.name,
      slug: genresTable.slug,
    })
    .from(movieGenresTable)
    .innerJoin(genresTable, eq(movieGenresTable.genreId, genresTable.id))
    .where(eq(movieGenresTable.movieId, movie.id))
    .orderBy(asc(genresTable.name));

  return { movie, genres: movieGenresList };
}

export default function Movie({ loaderData }: Route.ComponentProps) {
  const { movie, genres } = loaderData;

  return (
    <main className="p-8 max-w-xl">
      <Link to="/movies" className="text-sm text-gray-500 hover:underline">
        ← Back to movies
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">
        {movie.title}{" "}
        <span className="text-gray-500 font-normal">({movie.year})</span>
      </h1>

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
