import { Form, Link } from "react-router";
import type { Route } from "./+types/movies";
import { db } from "~/db/client.server";
import { movies as moviesTable } from "~/db/schema";

export function meta() {
  return [{ title: "Movies" }];
}

export async function loader() {
  return { movies: await db.select().from(moviesTable) };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
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

  await db.insert(moviesTable).values({ title, year });
  return { ok: true } as const;
}

export default function Movies({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const errors =
    actionData && "errors" in actionData ? actionData.errors : undefined;
  const values =
    actionData && "values" in actionData ? actionData.values : undefined;

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Movies</h1>

      <Form
        method="post"
        key={loaderData.movies.length}
        className="mb-6 flex gap-2 items-start"
      >
        <div className="flex-1">
          <input
            name="title"
            defaultValue={values?.title ?? ""}
            placeholder="Title"
            className="w-full border rounded px-2 py-1"
          />
          {errors?.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>
        <div className="w-24">
          <input
            name="year"
            defaultValue={values?.year ?? ""}
            placeholder="Year"
            className="w-full border rounded px-2 py-1"
          />
          {errors?.year && (
            <p className="text-sm text-red-600 mt-1">{errors.year}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-white rounded px-3 py-1"
        >
          Add
        </button>
      </Form>

      <ul className="space-y-1">
        {loaderData.movies.map((movie) => (
          <li key={movie.id}>
            <Link
              to={`/movies/${movie.id}`}
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
