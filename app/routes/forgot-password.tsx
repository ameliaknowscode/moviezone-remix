import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/forgot-password";
import { auth } from "~/auth.server";

export function meta() {
  return [{ title: "Forgot password — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) throw redirect("/profile");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required", values: { email } };
  }

  // Better Auth's requestPasswordReset returns 200 even if the email
  // doesn't exist, to prevent enumeration. We always show "check your
  // email" — the user gets the link if and only if there's an account.
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: "/reset-password" },
  });

  return { sent: true } as const;
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  if (actionData && "sent" in actionData) {
    return (
      <main className="p-8 max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="mb-4">
          If an account exists for that email, we sent a password reset link.
          Click the link to choose a new password.
        </p>
        <p className="text-sm text-gray-500">
          <Link to="/sign-in" className="underline">
            Back to sign in
          </Link>
        </p>
      </main>
    );
  }

  const error =
    actionData && "error" in actionData ? actionData.error : undefined;
  const values =
    actionData && "values" in actionData ? actionData.values : undefined;

  return (
    <main className="p-8 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Forgot password</h1>
      <p className="mb-4 text-sm text-gray-600">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <Form method="post" className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={values?.email ?? ""}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Send reset link
        </button>
      </Form>
      <p className="text-sm text-gray-500 mt-4">
        Remember your password?{" "}
        <Link to="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
