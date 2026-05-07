import { redirect } from "react-router";
import type { Route } from "./+types/sign-out";
import { auth } from "~/auth.server";

export async function loader() {
  throw redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  const response = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  });

  const setCookie = response.headers.get("set-cookie");
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      ...(setCookie ? { "Set-Cookie": setCookie } : {}),
    },
  });
}
