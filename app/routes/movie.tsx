import { Link } from "react-router";
import { asc, eq } from "drizzle-orm";
import type { Route } from "./+types/movie";
import { db } from "~/db/client.server";
import {
  creditTypes as creditTypesTable,
  credits as creditsTable,
  genres as genresTable,
  movieGenres as movieGenresTable,
  movies as moviesTable,
  people as peopleTable,
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

  const [movieGenresList, movieCreditsList] = await Promise.all([
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
  ]);

  const cast = movieCreditsList.filter((c) => !c.typeIsCrew);
  const crew = movieCreditsList.filter((c) => c.typeIsCrew);

  return { movie, genres: movieGenresList, cast, crew };
}

export default function Movie({ loaderData }: Route.ComponentProps) {
  const { movie, genres, cast, crew } = loaderData;

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
