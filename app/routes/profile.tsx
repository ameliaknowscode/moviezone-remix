import { Form, Link, redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/profile";
import { auth } from "~/auth.server";
import { db } from "~/db/client.server";
import { users } from "~/db/schema";

export function meta() {
  return [{ title: "Profile — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const [userRecord] = await db
    .select({
      username: users.username,
      welcomedAt: users.welcomedAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userRecord?.welcomedAt) throw redirect("/welcome");

  return {
    user: session.user,
    username: userRecord.username,
  };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user, username } = loaderData;
  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <dl className="space-y-2 mb-6">
        <div>
          <dt className="text-sm text-gray-500">Display name</dt>
          <dd>{user.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Username</dt>
          <dd>{username ? `@${username}` : "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
      {username && (
        <p className="mb-6 text-sm">
          <Link to={`/users/${username}`} className="underline">
            View your public profile
          </Link>
        </p>
      )}
      <Form method="post" action="/sign-out">
        <button
          type="submit"
          className="text-sm text-red-600 hover:underline"
        >
          Sign out
        </button>
      </Form>
    </main>
  );
}
