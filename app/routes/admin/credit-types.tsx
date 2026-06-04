import { Link } from "react-router";
import { asc } from "drizzle-orm";
import type { Route } from "./+types/credit-types";
import { db } from "~/db/client.server";
import { creditTypes as creditTypesTable } from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";

export function meta() {
  return [{ title: "Credit types — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return {
    creditTypes: await db
      .select()
      .from(creditTypesTable)
      .orderBy(asc(creditTypesTable.name)),
  };
}

export default function AdminCreditTypes({
  loaderData,
}: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-xl">
      <Link to="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4">
        <h1 className="text-2xl font-bold">Credit types</h1>
        <Link
          to="/admin/credit-types/new"
          className="bg-black text-white rounded px-3 py-1 text-sm"
        >
          Add a type
        </Link>
      </div>

      {loaderData.creditTypes.length === 0 ? (
        <p className="text-sm text-gray-500">No credit types yet.</p>
      ) : (
        <ul className="space-y-1">
          {loaderData.creditTypes.map((type) => (
            <li key={type.id} className="flex items-center gap-2">
              <Link
                to={`/admin/credit-types/${type.slug}`}
                className="hover:underline"
              >
                {type.name}
              </Link>
              <span
                className={
                  type.isCrew
                    ? "text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5"
                    : "text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5"
                }
              >
                {type.isCrew ? "Crew" : "Cast"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
