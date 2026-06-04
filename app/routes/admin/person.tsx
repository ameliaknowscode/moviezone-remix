import { Form, Link, redirect, useSearchParams } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/person";
import { PersonFields } from "~/components/person-fields";
import { db } from "~/db/client.server";
import { people as peopleTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { slugify } from "~/lib/slug";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.person.name} — Admin` : "Person — Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const [person] = await db
    .select()
    .from(peopleTable)
    .where(eq(peopleTable.slug, params.slug))
    .limit(1);

  if (!person) {
    throw new Response("Not Found", { status: 404 });
  }

  return { person };
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.delete(peopleTable).where(eq(peopleTable.slug, params.slug));
    return redirect("/admin/people");
  }

  if (intent === "update") {
    const name = String(formData.get("name") ?? "").trim();
    const rawSlug = String(formData.get("slug") ?? "").trim();
    const newSlug = slugify(rawSlug);

    const errors: { name?: string; slug?: string } = {};
    if (!name) errors.name = "Name is required";
    if (!newSlug) errors.slug = "Slug is required";

    if (Object.keys(errors).length > 0) {
      return { errors, values: { name, slug: rawSlug } };
    }

    try {
      await db
        .update(peopleTable)
        .set({ name, slug: newSlug })
        .where(eq(peopleTable.slug, params.slug));
    } catch {
      return {
        errors: { slug: "Someone already uses this slug — try another" },
        values: { name, slug: newSlug },
      };
    }

    return redirect(`/admin/people/${newSlug}?saved=1`);
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function AdminPerson({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { person } = loaderData;
  const [searchParams] = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const errors = actionData?.errors;
  const values = actionData?.values;

  return (
    <main className="p-8 max-w-xl">
      <Link
        to="/admin/people"
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to admin people
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">{person.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Slug: {person.slug}</p>

      {saved && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Saved.
        </div>
      )}

      <Form method="post" className="space-y-3 mb-6">
        <input type="hidden" name="intent" value="update" />
        <PersonFields
          defaultName={values?.name ?? person.name}
          defaultSlug={values?.slug ?? person.slug}
          errors={errors}
        />
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
          Delete this person
        </button>
      </Form>
    </main>
  );
}
