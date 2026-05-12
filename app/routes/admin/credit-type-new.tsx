import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/credit-type-new";
import { db } from "~/db/client.server";
import { creditTypes as creditTypesTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { slugify } from "~/lib/slug";

export function meta() {
  return [{ title: "Add a credit type — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const isCrew = formData.get("isCrew") === "on";

  if (!name) {
    return { error: "Name is required", values: { name, isCrew } };
  }

  const slug = slugify(name);
  if (!slug) {
    return {
      error: "Name must contain at least one letter or number",
      values: { name, isCrew },
    };
  }

  try {
    await db.insert(creditTypesTable).values({ name, slug, isCrew });
  } catch {
    return {
      error: "A type with this name (or slug) already exists",
      values: { name, isCrew },
    };
  }

  return redirect(`/admin/credit-types/${slug}`);
}

export default function AdminCreditTypeNew({
  actionData,
}: Route.ComponentProps) {
  const error = actionData?.error;
  const values = actionData?.values;

  return (
    <main className="p-8 max-w-xl">
      <Link
        to="/admin/credit-types"
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to credit types
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">Add a credit type</h1>

      <Form method="post" className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            defaultValue={values?.name ?? ""}
            placeholder="Director, Actor, Writer..."
            className="w-full border rounded px-2 py-1"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isCrew"
            defaultChecked={values?.isCrew ?? false}
          />
          Crew (not cast)
        </label>

        <div>
          <button
            type="submit"
            className="bg-black text-white rounded px-3 py-1"
          >
            Add type
          </button>
        </div>
      </Form>
    </main>
  );
}
