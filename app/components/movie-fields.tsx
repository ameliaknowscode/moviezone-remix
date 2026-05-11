interface MovieRecord {
  title?: string | null;
  year?: number | null;
  synopsis?: string | null;
  runtime?: number | null;
  country?: string | null;
  language?: string | null;
  imdbId?: string | null;
  letterboxdSlug?: string | null;
}

interface MovieFormValues {
  title?: string;
  year?: string;
  synopsis?: string;
  runtime?: string;
  country?: string;
  language?: string;
  imdbId?: string;
  letterboxdSlug?: string;
}

interface MovieFieldsProps {
  defaults?: MovieRecord;
  values?: MovieFormValues;
  errors?: { title?: string; year?: string; runtime?: string };
}

function pickString(
  formValue: string | undefined,
  recordValue: string | number | null | undefined,
): string {
  if (formValue !== undefined) return formValue;
  if (recordValue === null || recordValue === undefined) return "";
  return String(recordValue);
}

export function MovieFields({ defaults, values, errors }: MovieFieldsProps) {
  const v = {
    title: pickString(values?.title, defaults?.title),
    year: pickString(values?.year, defaults?.year),
    synopsis: pickString(values?.synopsis, defaults?.synopsis),
    runtime: pickString(values?.runtime, defaults?.runtime),
    country: pickString(values?.country, defaults?.country),
    language: pickString(values?.language, defaults?.language),
    imdbId: pickString(values?.imdbId, defaults?.imdbId),
    letterboxdSlug: pickString(values?.letterboxdSlug, defaults?.letterboxdSlug),
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          name="title"
          defaultValue={v.title}
          className="w-full border rounded px-2 py-1"
        />
        {errors?.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Year</label>
        <input
          name="year"
          defaultValue={v.year}
          className="w-full border rounded px-2 py-1"
        />
        {errors?.year && (
          <p className="text-sm text-red-600 mt-1">{errors.year}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Runtime (minutes)</label>
        <input
          name="runtime"
          defaultValue={v.runtime}
          inputMode="numeric"
          className="w-full border rounded px-2 py-1"
        />
        {errors?.runtime && (
          <p className="text-sm text-red-600 mt-1">{errors.runtime}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Country</label>
        <input
          name="country"
          defaultValue={v.country}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Language</label>
        <input
          name="language"
          defaultValue={v.language}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">IMDb ID</label>
        <input
          name="imdbId"
          defaultValue={v.imdbId}
          placeholder="tt0133093"
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Letterboxd slug</label>
        <input
          name="letterboxdSlug"
          defaultValue={v.letterboxdSlug}
          placeholder="the-matrix"
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Synopsis</label>
        <textarea
          name="synopsis"
          defaultValue={v.synopsis}
          rows={4}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
}
