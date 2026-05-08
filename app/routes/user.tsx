import { eq } from "drizzle-orm";
import type { Route } from "./+types/user";
import { db } from "~/db/client.server";
import { users } from "~/db/schema";

export function meta({ data }: Route.MetaArgs) {
  const display = data?.user.name ?? data?.user.username;
  return [{ title: display ? `${display} — Movie Zone` : "Movie Zone" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const [userRecord] = await db
    .select({
      username: users.username,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, params.username))
    .limit(1);

  if (!userRecord || !userRecord.username) {
    throw new Response("Not Found", { status: 404 });
  }

  return { user: userRecord };
}

export default function UserProfile({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">
        {user.name ?? user.username}
      </h1>
      <p className="text-gray-500 text-sm mb-6">@{user.username}</p>
      <p className="text-sm text-gray-600">Joined {joined}.</p>
    </main>
  );
}
