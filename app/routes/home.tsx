import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Movie Zone — Track and rate the films you watch" },
    {
      name: "description",
      content:
        "A personal film diary — rate films, build watchlists, and follow what others are watching.",
    },
  ];
}

export default function Home() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Movie Zone</h1>
      <p className="text-lg text-gray-700 mb-6">
        A personal film diary. Rate the films you watch, build watchlists, and
        follow what others are watching.
      </p>
      <div className="flex gap-3">
        <Link to="/movies" className="bg-black text-white rounded px-4 py-2">
          Browse movies
        </Link>
        <Link
          to="/sign-up"
          className="border border-gray-300 rounded px-4 py-2"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
