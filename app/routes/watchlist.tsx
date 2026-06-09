import { Link } from "react-router";
import { desc, eq } from "drizzle-orm";
import type { Route } from "./+types/watchlist";
import { db } from "~/db/client.server";
import { requireUser } from "~/lib/require-user.server";
import {
  movies as moviesTable,
  watchlist as watchlistTable,
} from "~/db/schema";

export function meta() {
  return [{ title: "Watchlist" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  const rows = await db
    .select({
      id: moviesTable.id,
      title: moviesTable.title,
      year: moviesTable.year,
      slug: moviesTable.slug,
      addedAt: watchlistTable.addedAt,
    })
    .from(watchlistTable)
    .innerJoin(moviesTable, eq(watchlistTable.movieId, moviesTable.id))
    .where(eq(watchlistTable.userId, user.id))
    .orderBy(desc(watchlistTable.addedAt));

  return { movies: rows };
}

export default function Watchlist({ loaderData }: Route.ComponentProps) {
  const { movies } = loaderData;

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Watchlist</h1>

      {movies.length === 0 ? (
        <p className="text-gray-600">
          Nothing here yet. Browse{" "}
          <Link to="/movies" className="underline">
            movies
          </Link>{" "}
          and add some.
        </p>
      ) : (
        <ul className="space-y-1">
          {movies.map((movie) => (
            <li key={movie.id}>
              <Link
                to={movie.slug ? `/movies/${movie.slug}` : "#"}
                className="hover:underline"
              >
                {movie.title}
              </Link>{" "}
              <span className="text-gray-500">({movie.year})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
