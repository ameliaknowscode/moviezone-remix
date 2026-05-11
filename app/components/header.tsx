import { Form, Link } from "react-router";

interface HeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link to="/" className="font-bold text-lg">
          Movie Zone
        </Link>
        <nav className="flex-1 flex items-center gap-4 text-sm">
          <Link to="/movies" className="text-gray-700 hover:text-black">
            Movies
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="text-gray-700 hover:text-black">
              Admin
            </Link>
          )}
        </nav>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/profile" className="text-gray-700 hover:text-black">
              {user.name ?? user.email}
            </Link>
            <Form method="post" action="/sign-out">
              <button
                type="submit"
                className="text-gray-500 hover:text-black"
              >
                Sign out
              </button>
            </Form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/sign-in" className="text-gray-700 hover:text-black">
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="bg-black text-white rounded px-3 py-1"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
