/**
 * Builds a YAML frontmatter block from a plain object.
 * Handles strings, numbers, booleans, and string arrays.
 */
export function buildFrontmatter(properties: Record<string, unknown>): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${String(item)}`);
    } else {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}
