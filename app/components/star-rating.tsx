import { Fragment, useId, useRef } from "react";
import { Form } from "react-router";

const VALUES = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

interface InputProps {
  defaultValue: number | null;
  // When set, the picker commits itself (mouse click, or focus leaving after
  // keyboard changes). When omitted, it's a plain field in a larger form.
  onCommit?: (form: HTMLFormElement) => void;
  // Renders a "Clear" button that unchecks the picker without submitting.
  clearable?: boolean;
}

export function StarRatingInput({
  defaultValue,
  onCommit,
  clearable,
}: InputProps) {
  const idPrefix = useId();
  const isDirty = useRef(false);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  return (
    <div className="flex items-center gap-3">
      <fieldset
        ref={fieldsetRef}
        className="star-rating-fieldset flex w-fit"
        onBlur={(e) => {
          if (!onCommit || !isDirty.current) return;
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          isDirty.current = false;
          if (e.currentTarget.form) onCommit(e.currentTarget.form);
        }}
        onKeyDown={(e) => {
          if (!(e.target instanceof HTMLInputElement)) return;
          const value = parseFloat(e.target.value);
          const goingUp = e.key === "ArrowRight" || e.key === "ArrowDown";
          const goingDown = e.key === "ArrowLeft" || e.key === "ArrowUp";
          if ((goingUp && value === 5) || (goingDown && value === 0.5)) {
            e.preventDefault();
          }
        }}
      >
        <legend className="sr-only">Your rating</legend>
        {VALUES.map((value) => {
          const isLeftHalf = value % 1 === 0.5;
          const id = `${idPrefix}-rating-${value.toString().replace(".", "-")}`;
          return (
            <Fragment key={value}>
              <input
                type="radio"
                name="rating"
                id={id}
                value={value}
                defaultChecked={defaultValue === value}
                onChange={() => {
                  isDirty.current = true;
                }}
                onClick={(e) => {
                  if (onCommit && e.detail > 0 && e.currentTarget.form) {
                    isDirty.current = false;
                    onCommit(e.currentTarget.form);
                  }
                }}
                className="sr-only"
              />
              <label
                htmlFor={id}
                title={`${value} of 5`}
                className="relative w-3 h-6 overflow-hidden cursor-pointer block text-gray-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={`absolute top-0 w-6 h-6 fill-current ${
                    isLeftHalf ? "left-0" : "-left-3"
                  }`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </label>
            </Fragment>
          );
        })}
      </fieldset>

      {clearable && (
        <button
          type="button"
          onClick={() => {
            fieldsetRef.current
              ?.querySelectorAll<HTMLInputElement>('input[name="rating"]')
              .forEach((input) => {
                input.checked = false;
              });
          }}
          className="text-xs text-gray-500 hover:text-black underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface Props {
  current: number | null;
}

// Self-submitting picker for the movie detail page (rating-set / rating-clear).
export function StarRating({ current }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Form method="post">
        <input type="hidden" name="intent" value="rating-set" />
        <StarRatingInput
          key={current ?? "none"}
          defaultValue={current}
          onCommit={(form) => form.requestSubmit()}
        />
      </Form>

      {current !== null && (
        <>
          <span className="text-sm text-gray-600">{current} / 5</span>
          <Form method="post">
            <input type="hidden" name="intent" value="rating-clear" />
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Clear
            </button>
          </Form>
        </>
      )}
    </div>
  );
}
