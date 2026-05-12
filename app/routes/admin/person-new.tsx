import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/person-new";
import { PersonFields } from "~/components/person-fields";
import { db } from "~/db/client.server";
import { people as peopleTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { slugify } from "~/lib/slug";

export function meta() {
  return [{ title: "Add a person — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug);

  const errors: { name?: string; slug?: string } = {};
  if (!name) errors.name = "Name is required";
  if (!slug) errors.slug = "Slug is required";

  if (Object.keys(errors).length > 0) {
    return { errors, values: { name, slug: rawSlug } };
  }

  try {
    await db.insert(peopleTable).values({ name, slug });
  } catch {
    return {
      errors: { slug: "Someone already uses this slug — try another" },
      values: { name, slug },
    };
  }

  return redirect(`/admin/people/${slug}`);
}

export default function AdminPersonNew({ actionData }: Route.ComponentProps) {
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

      <h1 className="text-2xl font-bold mt-2 mb-4">Add a person</h1>

      <Form method="post" className="space-y-3">
        <PersonFields
          defaultName={values?.name ?? ""}
          defaultSlug={values?.slug ?? ""}
          errors={errors}
        />
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Add person
        </button>
      </Form>
    </main>
  );
}
