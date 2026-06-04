import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/sign-in";
import { auth } from "~/auth.server";

export function meta() {
  return [{ title: "Sign in — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) throw redirect("/profile");
  const url = new URL(request.url);
  return { resetSuccess: url.searchParams.get("reset") === "ok" };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required", values: { email } };
  }

  const response = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      error: data.message ?? "Sign in failed",
      values: { email },
    };
  }

  const setCookie = response.headers.get("set-cookie");
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/profile",
      ...(setCookie ? { "Set-Cookie": setCookie } : {}),
    },
  });
}

export default function SignIn({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <main className="p-8 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      {loaderData.resetSuccess && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
          Password reset. Sign in with your new password.
        </p>
      )}
      <Form method="post" className="space-y-3">
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
          Sign in
        </button>
      </Form>
      <p className="text-sm text-gray-500 mt-4">
        <Link to="/forgot-password" className="underline">
          Forgot your password?
        </Link>
      </p>
      <p className="text-sm text-gray-500 mt-2">
        New here?{" "}
        <Link to="/sign-up" className="underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
