import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movies", "routes/movies.tsx"),
  route("movies/:slug", "routes/movie.tsx"),
  route("api/auth/*", "routes/api.auth.tsx"),
  route("sign-up", "routes/sign-up.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("sign-out", "routes/sign-out.tsx"),
  route("verify-email-sent", "routes/verify-email-sent.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("welcome", "routes/welcome.tsx"),
  route("profile", "routes/profile.tsx"),
  route("users/:username", "routes/user.tsx"),
  route("admin", "routes/admin/index.tsx"),
  route("admin/movies", "routes/admin/movies.tsx"),
  route("admin/movies/new", "routes/admin/movie-new.tsx"),
  route("admin/movies/:slug", "routes/admin/movie.tsx"),
] satisfies RouteConfig;
