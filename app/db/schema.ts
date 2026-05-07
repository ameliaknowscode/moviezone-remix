import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
});
