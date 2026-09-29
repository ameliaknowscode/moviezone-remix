import { Link } from "react-router";
import { desc, eq, sql } from "drizzle-orm";
import type { Route } from "./+types/diary";
import { db } from "~/db/client.server";
import {
  diaryEntries as diaryEntriesTable,
  movies as moviesTable,
} from "~/db/schema";
import { formatWatchedOn, ratingStars } from "~/lib/diary";
import { requireUser } from "~/lib/require-user.server";

export function meta() {
  return [{ title: "Diary" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  // The window function sees every row that survives WHERE, so it must stay
  // user-wide. Filtering further (e.g. by year) would hide the original
  // watch; do that in an outer query over this one instead.
  const rows = await db
    .select({
      id: diaryEntriesTable.id,
      watchedOn: diaryEntriesTable.watchedOn,
      rating: diaryEntriesTable.rating,
      review: diaryEntriesTable.review,
      containsSpoilers: diaryEntriesTable.containsSpoilers,
      isRewatch: sql<boolean>`row_number() over (
        partition by ${diaryEntriesTable.userId}, ${diaryEntriesTable.movieId}
        order by ${diaryEntriesTable.watchedOn}, ${diaryEntriesTable.createdAt}
      ) > 1`,
      movieTitle: moviesTable.title,
      movieYear: moviesTable.year,
      movieSlug: moviesTable.slug,
    })
    .from(diaryEntriesTable)
    .innerJoin(moviesTable, eq(diaryEntriesTable.movieId, moviesTable.id))
    .where(eq(diaryEntriesTable.userId, user.id))
    .orderBy(desc(diaryEntriesTable.watchedOn), desc(diaryEntriesTable.createdAt));

  return {
    entries: rows.map((row) => ({
      ...row,
      rating: row.rating === null ? null : parseFloat(row.rating),
    })),
  };
}

export default function Diary({ loaderData }: Route.ComponentProps) {
  const { entries } = loaderData;

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Diary</h1>

      {entries.length === 0 ? (
        <p className="text-gray-600">
          Nothing logged yet. Find a{" "}
          <Link to="/movies" className="underline">
            movie
          </Link>{" "}
          and hit "Log a watch".
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm text-gray-500 w-24 shrink-0">
                  {formatWatchedOn(entry.watchedOn)}
                </span>
                <Link
                  to={entry.movieSlug ? `/movies/${entry.movieSlug}` : "#"}
                  className="font-medium hover:underline"
                >
                  {entry.movieTitle}
                </Link>
                <span className="text-gray-500">({entry.movieYear})</span>
                {entry.rating !== null && (
                  <span
                    className="text-amber-500"
                    title={`${entry.rating} of 5`}
                  >
                    {ratingStars(entry.rating)}
                  </span>
                )}
                {entry.isRewatch && (
                  <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                    Rewatch
                  </span>
                )}
              </div>

              {entry.review &&
                (entry.containsSpoilers ? (
                  <details className="mt-1 ml-26 text-sm">
                    <summary className="cursor-pointer text-gray-500">
                      Review contains spoilers — show
                    </summary>
                    <p className="mt-1 whitespace-pre-line text-gray-800">
                      {entry.review}
                    </p>
                  </details>
                ) : (
                  <p className="mt-1 ml-26 text-sm whitespace-pre-line text-gray-800">
                    {entry.review}
                  </p>
                ))}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
