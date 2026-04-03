import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const bookmarkItemSchema = z.object({
  value: z.string(),
});
export type BookmarkItem = z.infer<typeof bookmarkItemSchema>;

export const listBookmarksSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const addBookmarkSchema = z.object({
  path: z
    .string()
    .describe(
      "Exact file path e.g. 'My Note.md' or 'folder/note.md' — fuzzy name match is not supported",
    ),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listBookmarks(
  executor: ObsidianExecutor,
  input: z.infer<typeof listBookmarksSchema>,
): Promise<BookmarkItem[]> {
  const raw = await executor.runJson("bookmarks", {}, input.vault);
  return z.array(bookmarkItemSchema).parse(raw);
}

export async function addBookmark(
  executor: ObsidianExecutor,
  input: z.infer<typeof addBookmarkSchema>,
): Promise<void> {
  await executor.run("bookmark", { file: input.path }, input.vault);
}
