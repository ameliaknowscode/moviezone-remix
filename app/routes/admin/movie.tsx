import { Form, Link, redirect, useSearchParams } from "react-router";
import { asc, eq } from "drizzle-orm";
import type { Route } from "./+types/movie";
import { CreditsEditor } from "~/components/credits-editor";
import { MovieFields } from "~/components/movie-fields";
import { db } from "~/db/client.server";
import {
  creditTypes as creditTypesTable,
  credits as creditsTable,
  genres as genresTable,
  movieGenres as movieGenresTable,
  movies as moviesTable,
  people as peopleTable,
} from "~/db/schema";
import { requireAdmin } from "~/lib/require-admin.server";
import { movieSlug } from "~/lib/slug";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.movie.title} — Admin` : "Movie — Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const [movie] = await db
    .select()
    .from(moviesTable)
    .where(eq(moviesTable.slug, params.slug))
    .limit(1);

  if (!movie) {
    throw new Response("Not Found", { status: 404 });
  }

  const [allGenres, movieGenreRows, allPeople, allTypes, movieCredits] =
    await Promise.all([
      db
        .select({ id: genresTable.id, name: genresTable.name })
        .from(genresTable)
        .orderBy(asc(genresTable.name)),
      db
        .select({ genreId: movieGenresTable.genreId })
        .from(movieGenresTable)
        .where(eq(movieGenresTable.movieId, movie.id)),
      db
        .select({ id: peopleTable.id, name: peopleTable.name })
        .from(peopleTable)
        .orderBy(asc(peopleTable.name)),
      db
        .select({
          id: creditTypesTable.id,
          name: creditTypesTable.name,
          isCrew: creditTypesTable.isCrew,
        })
        .from(creditTypesTable)
        .orderBy(asc(creditTypesTable.name)),
      db
        .select({
          personId: creditsTable.personId,
          typeId: creditsTable.typeId,
          character: creditsTable.character,
          ordering: creditsTable.ordering,
        })
        .from(creditsTable)
        .where(eq(creditsTable.movieId, movie.id))
        .orderBy(asc(creditsTable.ordering)),
    ]);

  return {
    movie,
    allGenres,
    movieGenreIds: movieGenreRows.map((r) => r.genreId),
    allPeople,
    allTypes,
    movieCredits,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.delete(moviesTable).where(eq(moviesTable.slug, params.slug));
    return redirect("/admin/movies");
  }

  if (intent === "update") {
    const values = {
      title: String(formData.get("title") ?? "").trim(),
      year: String(formData.get("year") ?? "").trim(),
      synopsis: String(formData.get("synopsis") ?? "").trim(),
      runtime: String(formData.get("runtime") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim(),
      language: String(formData.get("language") ?? "").trim(),
      imdbId: String(formData.get("imdbId") ?? "").trim(),
      letterboxdSlug: String(formData.get("letterboxdSlug") ?? "").trim(),
    };
    const genreIds = formData
      .getAll("genreIds")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0);

    const creditPersonIds = formData.getAll("creditPersonId").map(String);
    const creditTypeIds = formData.getAll("creditTypeId").map(String);
    const creditCharacters = formData.getAll("creditCharacter").map(String);
    const creditOrderings = formData.getAll("creditOrdering").map(String);

    const creditsParsed = creditPersonIds
      .map((rawPersonId, i) => ({
        personId: Number(rawPersonId),
        typeId: Number(creditTypeIds[i] ?? ""),
        character: String(creditCharacters[i] ?? "").trim() || null,
        ordering: Number(creditOrderings[i] ?? "0"),
      }))
      .filter(
        (c) =>
          Number.isInteger(c.personId) &&
          c.personId > 0 &&
          Number.isInteger(c.typeId) &&
          c.typeId > 0 &&
          Number.isInteger(c.ordering),
      );

    const year = Number(values.year);
    const runtime = values.runtime ? Number(values.runtime) : null;

    const errors: { title?: string; year?: string; runtime?: string } = {};
    if (!values.title) errors.title = "Title is required";
    if (!values.year || !Number.isInteger(year)) {
      errors.year = "Year must be a whole number";
    }
    if (
      values.runtime &&
      (!Number.isInteger(runtime) || (runtime ?? 0) < 0)
    ) {
      errors.runtime = "Runtime must be a whole number of minutes";
    }

    if (Object.keys(errors).length > 0) {
      return { errors, values, genreIds };
    }

    const newSlug = movieSlug(values.title, year);

    try {
      await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(moviesTable)
          .set({
            title: values.title,
            year,
            slug: newSlug,
            synopsis: values.synopsis || null,
            runtime,
            country: values.country || null,
            language: values.language || null,
            imdbId: values.imdbId || null,
            letterboxdSlug: values.letterboxdSlug || null,
          })
          .where(eq(moviesTable.slug, params.slug))
          .returning({ id: moviesTable.id });

        await tx
          .delete(movieGenresTable)
          .where(eq(movieGenresTable.movieId, updated.id));

        if (genreIds.length > 0) {
          await tx.insert(movieGenresTable).values(
            genreIds.map((genreId) => ({
              movieId: updated.id,
              genreId,
            })),
          );
        }

        await tx
          .delete(creditsTable)
          .where(eq(creditsTable.movieId, updated.id));

        if (creditsParsed.length > 0) {
          await tx.insert(creditsTable).values(
            creditsParsed.map((c) => ({
              movieId: updated.id,
              personId: c.personId,
              typeId: c.typeId,
              character: c.character,
              ordering: c.ordering,
            })),
          );
        }
      });
    } catch {
      return {
        errors: {
          title: "A movie with this title and year already exists",
        },
        values,
        genreIds,
      };
    }

    return redirect(`/admin/movies/${newSlug}?saved=1`);
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function AdminMovie({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { movie, allGenres, movieGenreIds, allPeople, allTypes, movieCredits } =
    loaderData;
  const [searchParams] = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const errors =
    actionData && "errors" in actionData ? actionData.errors : undefined;
  const values =
    actionData && "values" in actionData ? actionData.values : undefined;
  const selectedGenreIds =
    actionData && "genreIds" in actionData ? actionData.genreIds : movieGenreIds;

  return (
    <main className="p-8 max-w-2xl">
      <Link to="/admin/movies" className="text-sm text-gray-500 hover:underline">
        ← Back to admin movies
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">
        {movie.title}{" "}
        <span className="text-gray-500 font-normal">({movie.year})</span>
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Public page:{" "}
        <Link
          to={movie.slug ? `/movies/${movie.slug}` : "#"}
          className="underline"
        >
          /movies/{movie.slug}
        </Link>
      </p>

      {saved && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Saved.
        </div>
      )}

      <Form method="post" className="space-y-6 mb-6">
        <input type="hidden" name="intent" value="update" />

        <MovieFields
          defaults={movie}
          values={values}
          errors={errors}
          allGenres={allGenres}
          selectedGenreIds={selectedGenreIds}
        />

        <div>
          <h2 className="text-sm font-semibold mb-2">Credits</h2>
          <CreditsEditor
            allPeople={allPeople}
            allTypes={allTypes}
            defaultCredits={movieCredits}
          />
        </div>

        <button type="submit" className="bg-black text-white rounded px-3 py-1">
          Update
        </button>
      </Form>

      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button
          type="submit"
          className="text-sm text-red-600 hover:underline"
        >
          Delete this movie
        </button>
      </Form>
    </main>
  );
}
