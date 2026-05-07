import { db } from "../app/db/client.server";
import { movies } from "../app/db/schema";

await db.insert(movies).values([
  { title: "Casablanca", year: 1942 },
  { title: "The Princess Bride", year: 1987 },
  { title: "Spirited Away", year: 2001 },
]);

console.log("Seeded movies");
process.exit(0);
