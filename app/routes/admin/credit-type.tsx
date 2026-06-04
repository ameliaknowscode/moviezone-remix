import { Form, Link, redirect, useSearchParams } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/credit-type";
import { db } from "~/db/client.server";
import { creditTypes as creditTypesTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { slugify } from "~/lib/slug";

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data
        ? `${data.creditType.name} — Admin`
        : "Credit type — Admin",
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const [creditType] = await db
    .select()
    .from(creditTypesTable)
    .where(eq(creditTypesTable.slug, params.slug))
    .limit(1);

  if (!creditType) {
    throw new Response("Not Found", { status: 404 });
  }

  return { creditType };
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db
      .delete(creditTypesTable)
      .where(eq(creditTypesTable.slug, params.slug));
    return redirect("/admin/credit-types");
  }

  if (intent === "update") {
    const name = String(formData.get("name") ?? "").trim();
    const isCrew = formData.get("isCrew") === "on";

    if (!name) {
      return { error: "Name is required", values: { name, isCrew } };
    }

    const newSlug = slugify(name);
    if (!newSlug) {
      return {
        error: "Name must contain at least one letter or number",
        values: { name, isCrew },
      };
    }

    try {
      await db
        .update(creditTypesTable)
        .set({ name, slug: newSlug, isCrew })
        .where(eq(creditTypesTable.slug, params.slug));
    } catch {
      return {
        error: "A type with this name (or slug) already exists",
        values: { name, isCrew },
      };
    }

    return redirect(`/admin/credit-types/${newSlug}?saved=1`);
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function AdminCreditType({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { creditType } = loaderData;
  const [searchParams] = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const error = actionData?.error;
  const formName = actionData?.values?.name ?? creditType.name;
  const formIsCrew = actionData?.values?.isCrew ?? creditType.isCrew;

  return (
    <main className="p-8 max-w-xl">
      <Link
        to="/admin/credit-types"
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to credit types
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">{creditType.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Slug: {creditType.slug} ·{" "}
        {creditType.isCrew ? "Crew" : "Cast"}
      </p>

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
            defaultValue={formName}
            className="w-full border rounded px-2 py-1"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isCrew"
            defaultChecked={formIsCrew}
          />
          Crew (not cast)
        </label>

        <div>
          <button
            type="submit"
            className="bg-black text-white rounded px-3 py-1"
          >
            Update
          </button>
        </div>
      </Form>

      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button
          type="submit"
          className="text-sm text-red-600 hover:underline"
        >
          Delete this type
        </button>
      </Form>
    </main>
  );
}
