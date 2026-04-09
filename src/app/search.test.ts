import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { executor, uniqueName, deleteTestNote } from "../../test/setup.js";
import { searchVault, searchVaultContext, listFiles } from "./search.js";

describe("search", () => {
  const noteName = uniqueName("search-fixture");

  beforeAll(async () => {
    await executor.run("create", {
      path: `${noteName}.md`,
      content: "# Search Fixture\n\nUnique phrase: xqzk9search.",
      overwrite: true,
    });
  });

  afterAll(async () => {
    await deleteTestNote(noteName);
  });

  describe("searchVault", () => {
    it("returns matching file paths as an array", async () => {
      const result = await searchVault(executor, { query: "xqzk9search" });
      expect(Array.isArray(result)).toBe(true);
      expect(result as string[]).toEqual(
        expect.arrayContaining([expect.stringContaining(noteName)]),
      );
    });

    it("returns empty array for no matches", async () => {
      const result = await searchVault(executor, { query: "zzznomatchzzz" });
      expect(result).toHaveLength(0);
    });
  });

  describe("searchVaultContext", () => {
    it("returns context for matching query", async () => {
      const result = await searchVaultContext(executor, {
        query: "xqzk9search",
      });
      const str = JSON.stringify(result);
      expect(str).toContain("xqzk9search");
    });
  });

  describe("listFiles", () => {
    it("returns a string listing files", async () => {
      const result = await listFiles(executor, {});
      expect(typeof result).toBe("string");
    });
  });
});
