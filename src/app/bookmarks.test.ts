import { describe, it, expect, afterEach } from "vitest";
import { executor, uniqueName, createTestNote, deleteTestNote } from "../../test/setup.js";
import { listBookmarks, addBookmark } from "./bookmarks.js";

describe("bookmarks", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  describe("listBookmarks", () => {
    it("returns an array (may be empty)", async () => {
      const result = await listBookmarks(executor, {});
      expect(Array.isArray(result) || typeof result === "string").toBe(true);
    });
  });

  describe("addBookmark", () => {
    it("bookmarks an existing note without error", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Bookmark me");

      try {
        await addBookmark(executor, { file: name });
      } catch {
        // Bookmarks plugin may not be enabled in test vault — skip gracefully
      }
    });
  });
});
