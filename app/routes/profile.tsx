import { Form, redirect } from "react-router";
import type { Route } from "./+types/profile";
import { auth } from "~/auth.server";

export function meta() {
  return [{ title: "Profile — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");
  return { user: session.user };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <dl className="space-y-2 mb-6">
        <div>
          <dt className="text-sm text-gray-500">Username</dt>
          <dd>{user.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
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
