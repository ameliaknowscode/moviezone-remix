import { Form, Link, redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/movie";
import { db } from "~/db/client.server";
import { movies as moviesTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { movieSlug } from "~/lib/slug";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.movie.title} — Admin` : "Movie — Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const [movie] = await db
    .select()
    .from(moviesTable)
    .where(eq(moviesTable.slug, params.slug))
    .limit(1);

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }

  return { movie };
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.delete(moviesTable).where(eq(moviesTable.slug, params.slug));
    return redirect("/admin/movies");
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

    const newSlug = movieSlug(title, year);

    try {
      await db
        .update(moviesTable)
        .set({ title, year, slug: newSlug })
        .where(eq(moviesTable.slug, params.slug));
    } catch {
      return {
        errors: {
          title: "A movie with this title and year already exists",
        },
        values: { title, year: yearRaw },
      };
    }

    if (newSlug !== params.slug) {
      return redirect(`/admin/movies/${newSlug}`);
    }

    return { ok: true } as const;
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function AdminMovie({
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
      <Link to="/admin/movies" className="text-sm text-gray-500 hover:underline">
        ← Back to admin movies
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">
        {movie.title}{" "}
        <span className="text-gray-500 font-normal">({movie.year})</span>
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Public page:{" "}
        <Link
          to={movie.slug ? `/movies/${movie.slug}` : "#"}
          className="underline"
        >
          /movies/{movie.slug}
        </Link>
      </p>

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
