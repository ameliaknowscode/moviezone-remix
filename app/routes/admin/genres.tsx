import { Link } from "react-router";
import { asc } from "drizzle-orm";
import type { Route } from "./+types/genres";
import { db } from "~/db/client.server";
import { genres as genresTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";

export function meta() {
  return [{ title: "Genres — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return {
    genres: await db.select().from(genresTable).orderBy(asc(genresTable.name)),
  };
}

export default function AdminGenres({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-xl">
      <Link to="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4">
        <h1 className="text-2xl font-bold">Genres</h1>
        <Link
          to="/admin/genres/new"
          className="bg-black text-white rounded px-3 py-1 text-sm"
        >
          Add a genre
        </Link>
      </div>

      {loaderData.genres.length === 0 ? (
        <p className="text-sm text-gray-500">No genres yet.</p>
      ) : (
        <ul className="space-y-1">
          {loaderData.genres.map((genre) => (
            <li key={genre.id}>
              <Link
                to={`/admin/genres/${genre.slug}`}
                className="hover:underline"
              >
                {genre.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
