import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/movie-new";
import { MovieFields } from "~/components/movie-fields";
import { db } from "~/db/client.server";
import { movies as moviesTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { movieSlug } from "~/lib/slug";

export function meta() {
  return [{ title: "Add a movie — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    year: String(formData.get("year") ?? "").trim(),
    synopsis: String(formData.get("synopsis") ?? "").trim(),
    runtime: String(formData.get("runtime") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    language: String(formData.get("language") ?? "").trim(),
    imdbId: String(formData.get("imdbId") ?? "").trim(),
    letterboxdSlug: String(formData.get("letterboxdSlug") ?? "").trim(),
  };

  const year = Number(values.year);
  const runtime = values.runtime ? Number(values.runtime) : null;

  const errors: { title?: string; year?: string; runtime?: string } = {};
  if (!values.title) errors.title = "Title is required";
  if (!values.year || !Number.isInteger(year)) {
    errors.year = "Year must be a whole number";
  }
  if (values.runtime && (!Number.isInteger(runtime) || (runtime ?? 0) < 0)) {
    errors.runtime = "Runtime must be a whole number of minutes";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const slug = movieSlug(values.title, year);

  try {
    await db.insert(moviesTable).values({
      title: values.title,
      year,
      slug,
      synopsis: values.synopsis || null,
      runtime,
      country: values.country || null,
      language: values.language || null,
      imdbId: values.imdbId || null,
      letterboxdSlug: values.letterboxdSlug || null,
    });
  } catch {
    return {
      errors: { title: "A movie with this title and year already exists" },
      values,
    };
  }

  return redirect(`/admin/movies/${slug}`);
}

export default function AdminMovieNew({ actionData }: Route.ComponentProps) {
  const errors =
    actionData && "errors" in actionData ? actionData.errors : undefined;
  const values =
    actionData && "values" in actionData ? actionData.values : undefined;

  return (
    <main className="p-8 max-w-xl">
      <Link to="/admin/movies" className="text-sm text-gray-500 hover:underline">
        ← Back to admin movies
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">Add a movie</h1>

      <Form method="post" className="space-y-3">
        <MovieFields values={values} errors={errors} />
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Add movie
        </button>
      </Form>
    </main>
  );
}
