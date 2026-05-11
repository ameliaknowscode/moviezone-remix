import type { Route } from "./+types/index";
import { requireAdmin } from "~/lib/require-admin.server";

export function meta() {
  return [{ title: "Admin — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);
  return { user };
}

export default function AdminIndex() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <p className="text-gray-700">
        This is the admin area for Movie Zone. CMS surfaces will land here as
        the catalog grows — movies, people, genres, and more.
      </p>
    </main>
  );
}
