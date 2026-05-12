import { Link } from "react-router";
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
      <p className="text-gray-700 mb-6">
        Admin area for Movie Zone. More CMS surfaces will land here as the
        catalog grows — people, genres, and beyond.
      </p>
      <ul className="space-y-2">
        <li>
          <Link to="/admin/movies" className="underline">
            Movies
          </Link>
        </li>
        <li>
          <Link to="/admin/genres" className="underline">
            Genres
          </Link>
        </li>
      </ul>
    </main>
  );
}
