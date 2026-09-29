import type {
  DiaryEntryErrors,
  DiaryEntryFormValues,
} from "~/components/diary-entry-fields";
import { VALID_RATINGS } from "~/lib/ratings";

// "Today" as YYYY-MM-DD in the server's local time zone. Good enough while
// dev and prod share a zone; revisit if the server runs in UTC.
export function todayIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

// Formats a YYYY-MM-DD string as e.g. "Sep 28, 2026". Pinned to UTC and an
// explicit locale so server and browser render identical text (no
// hydration mismatch, no off-by-one day from local time zones).
export function formatWatchedOn(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ratingStars(rating: number): string {
  return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

type ParseResult =
  | {
      ok: true;
      data: {
        watchedOn: string;
        rating: string | null;
        review: string | null;
        containsSpoilers: boolean;
      };
    }
  | { ok: false; errors: DiaryEntryErrors; values: DiaryEntryFormValues };

export function parseDiaryEntryForm(formData: FormData): ParseResult {
  const watchedOn = String(formData.get("watchedOn") ?? "").trim();
  const ratingRaw = formData.get("rating");
  const rating = typeof ratingRaw === "string" ? ratingRaw : null;
  const review = String(formData.get("review") ?? "").trim();
  const containsSpoilers = formData.get("containsSpoilers") === "on";

  const errors: DiaryEntryErrors = {};
  if (!isRealDate(watchedOn)) {
    errors.watchedOn = "Enter a valid date";
  } else if (watchedOn > todayIso()) {
    errors.watchedOn = "Watch date can't be in the future";
  }
  if (rating !== null && !VALID_RATINGS.has(rating)) {
    errors.rating = "Pick a rating from half a star to five stars";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      values: {
        watchedOn,
        rating: rating !== null && VALID_RATINGS.has(rating)
          ? parseFloat(rating)
          : null,
        review,
        containsSpoilers,
      },
    };
  }

  return {
    ok: true,
    data: { watchedOn, rating, review: review || null, containsSpoilers },
  };
}
