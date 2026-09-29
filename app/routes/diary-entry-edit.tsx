import { Form, Link, redirect } from "react-router";
import { and, desc, eq } from "drizzle-orm";
import type { Route } from "./+types/diary-entry-edit";
import { DiaryEntryFields } from "~/components/diary-entry-fields";
import { db } from "~/db/client.server";
import {
  diaryEntries as diaryEntriesTable,
  movies as moviesTable,
  userMovieRating as userMovieRatingTable,
} from "~/db/schema";
import { parseDiaryEntryForm, todayIso } from "~/lib/diary";
import { requireUser } from "~/lib/require-user.server";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `Edit ${data.entry.movieTitle}` : "Edit entry" }];
}

// Scoped to the owner: someone else's entry is indistinguishable from a
// missing one, so ids can't be probed.
async function findOwnEntry(idParam: string, userId: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Response("Not Found", { status: 404 });
  }

  const [entry] = await db
    .select({
      id: diaryEntriesTable.id,
      movieId: diaryEntriesTable.movieId,
      watchedOn: diaryEntriesTable.watchedOn,
      rating: diaryEntriesTable.rating,
      review: diaryEntriesTable.review,
      containsSpoilers: diaryEntriesTable.containsSpoilers,
      movieTitle: moviesTable.title,
      movieYear: moviesTable.year,
      movieSlug: moviesTable.slug,
    })
    .from(diaryEntriesTable)
    .innerJoin(moviesTable, eq(diaryEntriesTable.movieId, moviesTable.id))
    .where(
      and(eq(diaryEntriesTable.id, id), eq(diaryEntriesTable.userId, userId)),
    )
    .limit(1);

  if (!entry) {
    throw new Response("Not Found", { status: 404 });
  }
  return entry;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const entry = await findOwnEntry(params.id, user.id);

  return {
    entry: {
      ...entry,
      rating: entry.rating === null ? null : parseFloat(entry.rating),
    },
    today: todayIso(),
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const entry = await findOwnEntry(params.id, user.id);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    // user_movie_rating is left alone: it stands on its own once written.
    await db
      .delete(diaryEntriesTable)
      .where(eq(diaryEntriesTable.id, entry.id));
    return redirect("/diary");
  }

  if (intent === "update") {
    const parsed = parseDiaryEntryForm(formData);
    if (!parsed.ok) {
      return { errors: parsed.errors, values: parsed.values };
    }
    const data = parsed.data;

    await db.transaction(async (tx) => {
      await tx
        .update(diaryEntriesTable)
        .set(data)
        .where(eq(diaryEntriesTable.id, entry.id));

      if (data.rating === null) return;

      // Only the most recent watch speaks for "what I think of this film
      // now"; re-rating an old entry just corrects the history.
      const [latest] = await tx
        .select({ id: diaryEntriesTable.id })
        .from(diaryEntriesTable)
        .where(
          and(
            eq(diaryEntriesTable.userId, user.id),
            eq(diaryEntriesTable.movieId, entry.movieId),
          ),
        )
        .orderBy(
          desc(diaryEntriesTable.watchedOn),
          desc(diaryEntriesTable.createdAt),
        )
        .limit(1);

      if (latest?.id === entry.id) {
        await tx
          .insert(userMovieRatingTable)
          .values({
            userId: user.id,
            movieId: entry.movieId,
            rating: data.rating,
          })
          .onConflictDoUpdate({
            target: [userMovieRatingTable.userId, userMovieRatingTable.movieId],
            set: { rating: data.rating, updatedAt: new Date() },
          });
      }
    });

    return redirect("/diary");
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function DiaryEntryEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { entry, today } = loaderData;
  const values = actionData?.values ?? {
    watchedOn: entry.watchedOn,
    rating: entry.rating,
    review: entry.review ?? "",
    containsSpoilers: entry.containsSpoilers,
  };

  return (
    <main className="p-8 max-w-xl">
      <Link to="/diary" className="text-sm text-gray-500 hover:underline">
        ← Back to diary
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">
        Edit{" "}
        <Link
          to={entry.movieSlug ? `/movies/${entry.movieSlug}` : "#"}
          className="hover:underline"
        >
          {entry.movieTitle}
        </Link>{" "}
        <span className="text-gray-500 font-normal">({entry.movieYear})</span>
      </h1>

      <Form method="post" className="space-y-3 mb-6">
        <input type="hidden" name="intent" value="update" />
        <DiaryEntryFields
          values={values}
          errors={actionData?.errors}
          maxDate={today}
        />
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Save
        </button>
      </Form>

      <Form
        method="post"
        onSubmit={(e) => {
          if (!confirm("Delete this diary entry? This can't be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="intent" value="delete" />
        <button
          type="submit"
          className="text-sm text-red-600 hover:underline"
        >
          Delete entry
        </button>
      </Form>
    </main>
  );
}
