import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movies", "routes/movies.tsx"),
  route("movies/:id", "routes/movie.tsx"),
] satisfies RouteConfig;
