import { Link } from "react-router";
import type { Route } from "./+types/movies";
import { db } from "~/db/client.server";
import { movies as moviesTable } from "~/db/schema";

export function meta() {
  return [{ title: "Movies" }];
}

export async function loader() {
  return { movies: await db.select().from(moviesTable) };
}

export default function Movies({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Movies</h1>

      <ul className="space-y-1">
        {loaderData.movies.map((movie) => (
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
    </main>
  );
}
