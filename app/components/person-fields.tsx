import { useState } from "react";
import { slugify } from "~/lib/slug";

interface PersonFieldsProps {
  defaultName?: string;
  defaultSlug?: string;
  errors?: { name?: string; slug?: string };
}

export function PersonFields({
  defaultName = "",
  defaultSlug = "",
  errors,
}: PersonFieldsProps) {
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugIsDirty, setSlugIsDirty] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugIsDirty) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugIsDirty(true);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          name="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        {errors?.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full border rounded px-2 py-1 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Auto-filled from the name. Edit if you need to disambiguate (e.g.,
          two people share a name).
        </p>
        {errors?.slug && (
          <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
        )}
      </div>
    </div>
  );
}
