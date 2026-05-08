import { Link } from "react-router";

export function meta() {
  return [{ title: "Check your email — Movie Zone" }];
}

export default function VerifyEmailSent() {
  return (
    <main className="p-8 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Check your email</h1>
      <p className="mb-4">
        We sent a verification link to the email address you registered with.
        Click the link to finish setting up your account.
      </p>
      <p className="text-sm text-gray-500">
        Didn't get the email?{" "}
        <Link to="/sign-in" className="underline">
          Try signing in
        </Link>{" "}
        — we'll send a fresh link.
      </p>
    </main>
  );
}
