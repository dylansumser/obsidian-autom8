/**
 * Asserts that at least one of the provided values is non-empty.
 * Throws a descriptive error if none are supplied — gives agents a clear
 * signal rather than a cryptic CLI failure.
 */
export function requireOneOf(fields: Record<string, string | undefined>): void {
  const provided = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (provided.length === 0) {
    const names = Object.keys(fields).join(" or ");
    throw new Error(`At least one of ${names} is required.`);
  }
}
