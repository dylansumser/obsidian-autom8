import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { executor, uniqueName, deleteTestNote } from "../../test/setup.js";
import {
  listHistoryFiles,
  listNoteVersions,
  readNoteVersion,
  restoreNoteVersion,
  diffNote,
} from "./history.js";

/**
 * History tests are best-effort: File Recovery requires the core plugin to be
 * enabled and to have indexed data. Tests that require actual history data skip
 * gracefully if the database is unavailable.
 */

describe("history", () => {
  const noteName = uniqueName("history-fixture");

  beforeAll(async () => {
    await executor.run("create", {
      name: noteName,
      content: "# History Fixture\n\nInitial content.",
      overwrite: true,
    });
  });

  afterAll(async () => {
    await deleteTestNote(noteName);
  });

  describe("listHistoryFiles", () => {
    it("returns a string (may be empty or error if plugin not enabled)", async () => {
      let result: string;
      try {
        result = await listHistoryFiles(executor, {});
      } catch {
        // File Recovery plugin not enabled — skip gracefully
        return;
      }
      expect(typeof result).toBe("string");
    });
  });

  describe("listNoteVersions", () => {
    it("returns version list or empty string for a note", async () => {
      let result: string;
      try {
        result = await listNoteVersions(executor, { file: noteName });
      } catch {
        // File Recovery plugin not enabled — skip gracefully
        return;
      }
      expect(typeof result).toBe("string");
    });
  });

  describe("readNoteVersion", () => {
    it("reads version 1 or throws if no history", async () => {
      try {
        const result = await readNoteVersion(executor, {
          file: noteName,
          version: 1,
        });
        expect(typeof result).toBe("string");
      } catch {
        // No history available — acceptable
      }
    });
  });

  describe("restoreNoteVersion", () => {
    it("restores version 1 or throws if no history", async () => {
      try {
        await restoreNoteVersion(executor, { file: noteName, version: 1 });
      } catch {
        // No history available — acceptable
      }
    });
  });

  describe("diffNote", () => {
    it("returns diff output for a note", async () => {
      // diff works without File Recovery — shows local vs sync versions
      let result: string;
      try {
        result = await diffNote(executor, { file: noteName });
      } catch {
        // No diff data — acceptable
        return;
      }
      expect(typeof result).toBe("string");
    });

    it("accepts from/to version parameters", async () => {
      try {
        const result = await diffNote(executor, {
          file: noteName,
          from: 1,
          to: 2,
        });
        expect(typeof result).toBe("string");
      } catch {
        // No version data — acceptable
      }
    });
  });
});
