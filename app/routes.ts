import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movies", "routes/movies.tsx"),
  route("movies/:id", "routes/movie.tsx"),
  route("api/auth/*", "routes/api.auth.tsx"),
  route("sign-up", "routes/sign-up.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("sign-out", "routes/sign-out.tsx"),
  route("verify-email-sent", "routes/verify-email-sent.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
