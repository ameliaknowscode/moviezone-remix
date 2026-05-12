import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/genre-new";
import { db } from "~/db/client.server";
import { genres as genresTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { slugify } from "~/lib/slug";

export function meta() {
  return [{ title: "Add a genre — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required", value: name };
  }

  const slug = slugify(name);
  if (!slug) {
    return {
      error: "Name must contain at least one letter or number",
      value: name,
    };
  }

  try {
    await db.insert(genresTable).values({ name, slug });
  } catch {
    return {
      error: "A genre with this name (or slug) already exists",
      value: name,
    };
  }

  return redirect(`/admin/genres/${slug}`);
}

export default function AdminGenreNew({ actionData }: Route.ComponentProps) {
  const error = actionData?.error;
  const value = actionData?.value ?? "";

  return (
    <main className="p-8 max-w-xl">
      <Link
        to="/admin/genres"
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to admin genres
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">Add a genre</h1>

      <Form method="post" className="space-y-3">
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
          Add genre
        </button>
      </Form>
    </main>
  );
}
