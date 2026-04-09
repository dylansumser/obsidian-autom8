import { randomUUID } from "node:crypto";
import { ObsidianExecutor } from "../src/app/executor.js";
import { buildFrontmatter } from "../src/app/frontmatter.js";
export { buildFrontmatter };

export const TEST_VAULT = process.env.OBSIDIAN_VAULT ?? "test-vault";

export const executor = ObsidianExecutor.getInstance(TEST_VAULT);

export function uniqueName(prefix = "test-mcp"): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export async function createTestNote(
  name: string,
  content = "# Test Note",
  properties?: Record<string, unknown>,
): Promise<void> {
  let fullContent = content;
  if (properties && Object.keys(properties).length > 0) {
    fullContent = `${buildFrontmatter(properties)}\n\n${content}`;
  }
  await executor.run("create", { path: `${name}.md`, content: fullContent, overwrite: true });
}

export async function deleteTestNote(name: string): Promise<void> {
  try {
    await executor.run("delete", { path: `${name}.md`, permanent: true });
  } catch {
    // already gone — ignore
  }
}
