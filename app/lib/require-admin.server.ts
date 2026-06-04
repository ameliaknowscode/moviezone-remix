import { redirect } from "react-router";
import { auth } from "~/auth.server";

export async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/sign-in");
  if (session.user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return session.user;
}
