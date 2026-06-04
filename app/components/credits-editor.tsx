import { useRef, useState } from "react";

interface PersonOption {
  id: number;
  name: string;
}

interface CreditTypeOption {
  id: number;
  name: string;
  isCrew: boolean;
}

export interface CreditRowInput {
  personId: number;
  typeId: number;
  character: string | null;
  ordering: number;
}

interface CreditRow {
  clientKey: string;
  personId: string;
  typeId: string;
  character: string;
  ordering: string;
}

interface CreditsEditorProps {
  allPeople: PersonOption[];
  allTypes: CreditTypeOption[];
  defaultCredits: CreditRowInput[];
}

function toRow(input: CreditRowInput, clientKey: string): CreditRow {
  return {
    clientKey,
    personId: String(input.personId),
    typeId: String(input.typeId),
    character: input.character ?? "",
    ordering: String(input.ordering),
  };
}

export function CreditsEditor({
  allPeople,
  allTypes,
  defaultCredits,
}: CreditsEditorProps) {
  const nextKeyRef = useRef(defaultCredits.length);
  const [rows, setRows] = useState<CreditRow[]>(
    defaultCredits.map((c, i) => toRow(c, `row-${i}`)),
  );

  function makeKey() {
    const key = `row-${nextKeyRef.current}`;
    nextKeyRef.current += 1;
    return key;
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        clientKey: makeKey(),
        personId: "",
        typeId: "",
        character: "",
        ordering: String(prev.length),
      },
    ]);
  }

  function removeRow(clientKey: string) {
    setRows((prev) => prev.filter((r) => r.clientKey !== clientKey));
  }

  function updateRow(clientKey: string, patch: Partial<CreditRow>) {
    setRows((prev) =>
      prev.map((r) => (r.clientKey === clientKey ? { ...r, ...patch } : r)),
    );
  }

  if (allPeople.length === 0 || allTypes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Add at least one{" "}
        <a href="/admin/people" className="underline">
          person
        </a>{" "}
        and one{" "}
        <a href="/admin/credit-types" className="underline">
          credit type
        </a>{" "}
        before adding credits.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-sm text-gray-500">No credits yet.</p>
      )}

      {rows.map((row) => (
        <div
          key={row.clientKey}
          className="grid grid-cols-12 gap-2 items-start"
        >
          <select
            name="creditPersonId"
            value={row.personId}
            onChange={(e) =>
              updateRow(row.clientKey, { personId: e.target.value })
            }
            className="col-span-4 border rounded px-2 py-1 text-sm"
          >
            <option value="">— Person —</option>
            {allPeople.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            name="creditTypeId"
            value={row.typeId}
            onChange={(e) =>
              updateRow(row.clientKey, { typeId: e.target.value })
            }
            className="col-span-3 border rounded px-2 py-1 text-sm"
          >
            <option value="">— Type —</option>
            {allTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            name="creditCharacter"
            value={row.character}
            onChange={(e) =>
              updateRow(row.clientKey, { character: e.target.value })
            }
            placeholder="Character"
            className="col-span-3 border rounded px-2 py-1 text-sm"
          />

          <input
            name="creditOrdering"
            value={row.ordering}
            onChange={(e) =>
              updateRow(row.clientKey, { ordering: e.target.value })
            }
            inputMode="numeric"
            placeholder="#"
            className="col-span-1 border rounded px-2 py-1 text-sm"
          />

          <button
            type="button"
            onClick={() => removeRow(row.clientKey)}
            className="col-span-1 text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="text-sm text-blue-700 hover:underline"
      >
        + Add credit
      </button>
    </div>
  );
}
