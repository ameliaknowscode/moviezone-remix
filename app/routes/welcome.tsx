import { Form, redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/welcome";
import { auth } from "~/auth.server";
import { db } from "~/db/client.server";
import { users } from "~/db/schema";

export function meta() {
  return [{ title: "Welcome — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  const [userRecord] = await db
    .select({ name: users.name, welcomedAt: users.welcomedAt })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userRecord?.welcomedAt) throw redirect("/movies");

  return { name: userRecord?.name ?? null };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");

  await db
    .update(users)
    .set({ welcomedAt: new Date() })
    .where(eq(users.id, session.user.id));

  throw redirect("/movies");
}

const steps = [
  {
    title: "Rate movies you've seen",
    body: "Give films a star rating and unlock personalised recommendations the more you rate.",
  },
  {
    title: "Build your watchlist",
    body: "Save films you want to see, log ones you've watched, and write reviews in your diary.",
  },
  {
    title: "Follow people",
    body: "See what others are watching and rating in your personal activity feed.",
  },
];

export default function Welcome({ loaderData }: Route.ComponentProps) {
  const greeting = loaderData.name
    ? `Welcome to Movie Zone, ${loaderData.name}!`
    : "Welcome to Movie Zone!";

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="bg-amber-100 rounded-lg p-8 text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{greeting}</h1>
        <p className="text-gray-700">Your personal film diary starts here.</p>
      </div>

      <ol className="space-y-4 mb-6">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="text-sm text-gray-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Form method="post">
        <button
          type="submit"
          className="w-full bg-black text-white rounded px-4 py-3 font-semibold"
        >
          Start browsing movies
        </button>
      </Form>
    </main>
  );
}
