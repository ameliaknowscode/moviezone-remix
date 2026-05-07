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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Movies</h1>
      <ul className="space-y-1">
        {loaderData.movies.map((movie) => (
          <li key={movie.id}>
            {movie.title} <span className="text-gray-500">({movie.year})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
