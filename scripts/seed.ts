import { db } from "../app/db/client.server";
import { movies } from "../app/db/schema";
import { movieSlug } from "../app/lib/slug";

const seedMovies = [
  {
    title: "Casablanca",
    year: 1942,
    slug: movieSlug("Casablanca", 1942),
    synopsis:
      "A cynical American expatriate struggles to decide whether or not he should help his former lover and her fugitive husband escape French Morocco.",
    runtime: 102,
    country: "United States",
    language: "English",
    imdbId: "tt0034583",
    letterboxdSlug: "casablanca",
  },
  {
    title: "The Princess Bride",
    year: 1987,
    slug: movieSlug("The Princess Bride", 1987),
  },
  {
    title: "Spirited Away",
    year: 2001,
    slug: movieSlug("Spirited Away", 2001),
  },
];

for (const movie of seedMovies) {
  await db
    .insert(movies)
    .values(movie)
    .onConflictDoUpdate({ target: movies.slug, set: movie });
}

console.log(`Seeded ${seedMovies.length} movies`);
process.exit(0);
