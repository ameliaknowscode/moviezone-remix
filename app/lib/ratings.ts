// Allowlist matching how JSX serializes the picker's numeric values
// (e.g. "5", not "5.0").
export const VALID_RATINGS = new Set([
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5",
]);
