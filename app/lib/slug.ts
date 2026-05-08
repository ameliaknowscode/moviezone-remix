export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function movieSlug(title: string, year: number): string {
  return `${slugify(title)}-${year}`;
}
