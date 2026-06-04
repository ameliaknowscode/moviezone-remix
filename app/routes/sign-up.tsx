import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/sign-up";
import { auth } from "~/auth.server";

export function meta() {
  return [{ title: "Sign up — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) throw redirect("/profile");
  return null;
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    return {
      error: "All fields are required",
      values: { email, username },
    };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Username must be 3–20 characters: lowercase letters, numbers, or underscores.",
      values: { email, username },
    };
  }

  const response = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: username,
      username,
      callbackURL: "/profile",
    },
    asResponse: true,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      error: data.message ?? "Sign up failed",
      values: { email, username },
    };
  }

  return redirect("/verify-email-sent");
}

export default function SignUp({ actionData }: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Sign up</h1>
      <Form method="post" className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            name="username"
            defaultValue={actionData?.values?.username ?? ""}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={actionData?.values?.email ?? ""}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        {actionData?.error && (
          <p className="text-sm text-red-600">{actionData.error}</p>
        )}
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Create account
        </button>
      </Form>
      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link to="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
