import { Link } from "react-router";
import type { Route } from "./+types/movies";
import { db } from "~/db/client.server";
import { movies as moviesTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";

export function meta() {
  return [{ title: "Movies — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return { movies: await db.select().from(moviesTable) };
}

export default function AdminMovies({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-xl">
      <Link to="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4">
        <h1 className="text-2xl font-bold">Movies</h1>
        <Link
          to="/admin/movies/new"
          className="bg-black text-white rounded px-3 py-1 text-sm"
        >
          Add a movie
        </Link>
      </div>

      <ul className="space-y-1">
        {loaderData.movies.map((movie) => (
          <li key={movie.id}>
            <Link
              to={movie.slug ? `/admin/movies/${movie.slug}` : "#"}
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
