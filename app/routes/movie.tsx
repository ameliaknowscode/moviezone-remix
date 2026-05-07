import { Form, Link, redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/movie";
import { db } from "~/db/client.server";
import { movies as moviesTable } from "~/db/schema";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? data.movie.title : "Movie" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    throw new Response("Not Found", { status: 404 });
  }

  const [movie] = await db
    .select()
    .from(moviesTable)
    .where(eq(moviesTable.id, id));

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }

  return { movie };
}

export async function action({ params, request }: Route.ActionArgs) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.delete(moviesTable).where(eq(moviesTable.id, id));
    return redirect("/movies");
  }

  if (intent === "update") {
    const title = String(formData.get("title") ?? "").trim();
    const yearRaw = String(formData.get("year") ?? "").trim();
    const year = Number(yearRaw);

    const errors: { title?: string; year?: string } = {};
    if (!title) errors.title = "Title is required";
    if (!yearRaw || !Number.isInteger(year)) {
      errors.year = "Year must be a whole number";
    }

    if (Object.keys(errors).length > 0) {
      return { errors, values: { title, year: yearRaw } };
    }

    await db
      .update(moviesTable)
      .set({ title, year })
      .where(eq(moviesTable.id, id));

    return { ok: true } as const;
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function Movie({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { movie } = loaderData;
  const errors =
    actionData && "errors" in actionData ? actionData.errors : undefined;
  const values =
    actionData && "values" in actionData ? actionData.values : undefined;

  return (
    <main className="p-8 max-w-xl">
      <Link to="/movies" className="text-sm text-gray-500 hover:underline">
        ← Back to movies
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">
        {movie.title}{" "}
        <span className="text-gray-500 font-normal">({movie.year})</span>
      </h1>

      <Form method="post" className="space-y-2 mb-6">
        <input type="hidden" name="intent" value="update" />
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            defaultValue={values?.title ?? movie.title}
            className="w-full border rounded px-2 py-1"
          />
          {errors?.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Year</label>
          <input
            name="year"
            defaultValue={values?.year ?? String(movie.year)}
            className="w-full border rounded px-2 py-1"
          />
          {errors?.year && (
            <p className="text-sm text-red-600 mt-1">{errors.year}</p>
          )}
        </div>
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Update
        </button>
      </Form>

      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button
          type="submit"
          className="text-sm text-red-600 hover:underline"
        >
          Delete this movie
        </button>
      </Form>
    </main>
  );
}
