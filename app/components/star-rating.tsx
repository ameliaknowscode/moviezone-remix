import { Fragment, useRef } from "react";
import { Form } from "react-router";

const VALUES = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

interface Props {
  current: number | null;
}

export function StarRating({ current }: Props) {
  const isDirty = useRef(false);

  return (
    <div className="flex items-center gap-3">
      <Form method="post">
        <input type="hidden" name="intent" value="rating-set" />
        <fieldset
          key={current ?? "none"}
          className="star-rating-fieldset flex w-fit"
          onBlur={(e) => {
            if (!isDirty.current) return;
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            isDirty.current = false;
            e.currentTarget.form?.requestSubmit();
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
            const id = `rating-${value.toString().replace(".", "-")}`;
            return (
              <Fragment key={value}>
                <input
                  type="radio"
                  name="rating"
                  id={id}
                  value={value}
                  defaultChecked={current === value}
                  onChange={() => {
                    isDirty.current = true;
                  }}
                  onClick={(e) => {
                    if (e.detail > 0) {
                      isDirty.current = false;
                      e.currentTarget.form?.requestSubmit();
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
