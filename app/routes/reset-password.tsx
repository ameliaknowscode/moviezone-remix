import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/reset-password";
import { auth } from "~/auth.server";

export function meta() {
  return [{ title: "Reset password — Movie Zone" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) throw redirect("/profile");
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) throw redirect("/forgot-password");
  return { token };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!newPassword || !confirmPassword || !token) {
    return { error: "All fields are required" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords don't match" };
  }

  const response = await auth.api.resetPassword({
    body: { newPassword, token },
    asResponse: true,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      error: data.message ?? "Reset failed — the link may be expired",
    };
  }

  throw redirect("/sign-in?reset=ok");
}

export default function ResetPassword({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const error = actionData?.error;
  return (
    <main className="p-8 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Reset password</h1>
      <Form method="post" className="space-y-3">
        <input type="hidden" name="token" value={loaderData.token} />
        <div>
          <label className="block text-sm mb-1">New password</label>
          <input
            type="password"
            name="newPassword"
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirm new password</label>
          <input
            type="password"
            name="confirmPassword"
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Set new password
        </button>
      </Form>
      <p className="text-sm text-gray-500 mt-4">
        <Link to="/sign-in" className="underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
