import { Link } from "react-router";
import { asc } from "drizzle-orm";
import type { Route } from "./+types/people";
import { db } from "~/db/client.server";
import { people as peopleTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";

export function meta() {
  return [{ title: "People — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return {
    people: await db.select().from(peopleTable).orderBy(asc(peopleTable.name)),
  };
}

export default function AdminPeople({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-xl">
      <Link to="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4">
        <h1 className="text-2xl font-bold">People</h1>
        <Link
          to="/admin/people/new"
          className="bg-black text-white rounded px-3 py-1 text-sm"
        >
          Add a person
        </Link>
      </div>

      {loaderData.people.length === 0 ? (
        <p className="text-sm text-gray-500">No people yet.</p>
      ) : (
        <ul className="space-y-1">
          {loaderData.people.map((person) => (
            <li key={person.id}>
              <Link
                to={`/admin/people/${person.slug}`}
                className="hover:underline"
              >
                {person.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
