import { Form, Link, redirect, useSearchParams } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/genre";
import { db } from "~/db/client.server";
import { genres as genresTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { slugify } from "~/lib/slug";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.genre.name} — Admin` : "Genre — Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const [genre] = await db
    .select()
    .from(genresTable)
    .where(eq(genresTable.slug, params.slug))
    .limit(1);

  if (!genre) {
    throw new Response("Not Found", { status: 404 });
  }

  return { genre };
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.delete(genresTable).where(eq(genresTable.slug, params.slug));
    return redirect("/admin/genres");
  }

  if (intent === "update") {
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      return { error: "Name is required", value: name };
    }

    const newSlug = slugify(name);
    if (!newSlug) {
      return {
        error: "Name must contain at least one letter or number",
        value: name,
      };
    }

    try {
      await db
        .update(genresTable)
        .set({ name, slug: newSlug })
        .where(eq(genresTable.slug, params.slug));
    } catch {
      return {
        error: "A genre with this name (or slug) already exists",
        value: name,
      };
    }

    return redirect(`/admin/genres/${newSlug}?saved=1`);
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function AdminGenre({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { genre } = loaderData;
  const [searchParams] = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const error = actionData?.error;
  const value = actionData?.value ?? genre.name;

  return (
    <main className="p-8 max-w-xl">
      <Link
        to="/admin/genres"
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to admin genres
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">{genre.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Slug: {genre.slug}</p>

      {saved && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Saved.
        </div>
      )}

      <Form method="post" className="space-y-3 mb-6">
        <input type="hidden" name="intent" value="update" />
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            defaultValue={value}
            className="w-full border rounded px-2 py-1"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
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
          Delete this genre
        </button>
      </Form>
    </main>
  );
}
