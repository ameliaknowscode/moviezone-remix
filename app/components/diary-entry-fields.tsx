import { StarRatingInput } from "~/components/star-rating";

export interface DiaryEntryFormValues {
  watchedOn: string;
  rating: number | null;
  review: string;
  containsSpoilers: boolean;
}

export interface DiaryEntryErrors {
  watchedOn?: string;
  rating?: string;
}

interface DiaryEntryFieldsProps {
  values: DiaryEntryFormValues;
  errors?: DiaryEntryErrors;
  maxDate: string;
}

export function DiaryEntryFields({
  values,
  errors,
  maxDate,
}: DiaryEntryFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="watchedOn" className="block text-sm mb-1">
          Watched on
        </label>
        <input
          id="watchedOn"
          type="date"
          name="watchedOn"
          defaultValue={values.watchedOn}
          max={maxDate}
          required
          className="border rounded px-2 py-1"
        />
        {errors?.watchedOn && (
          <p className="text-sm text-red-600 mt-1">{errors.watchedOn}</p>
        )}
      </div>

      <div>
        <span className="block text-sm mb-1">Rating</span>
        <StarRatingInput defaultValue={values.rating} clearable />
        {errors?.rating && (
          <p className="text-sm text-red-600 mt-1">{errors.rating}</p>
        )}
      </div>

      <div>
        <label htmlFor="review" className="block text-sm mb-1">
          Review
        </label>
        <textarea
          id="review"
          name="review"
          defaultValue={values.review}
          rows={5}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="containsSpoilers"
          defaultChecked={values.containsSpoilers}
        />
        Contains spoilers
      </label>
    </div>
  );
}
