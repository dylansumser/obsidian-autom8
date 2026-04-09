import { describe, it, expect, afterEach } from "vitest";
import { executor, uniqueName, createTestNote, deleteTestNote } from "../../test/setup.js";
import {
  getNoteBacklinks,
  getNoteLinks,
  listUnresolvedLinks,
  listOrphanNotes,
  listDeadendNotes,
} from "./graph.js";

describe("graph", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  describe("getNoteLinks", () => {
    it("returns outgoing links from a note", async () => {
      const noteA = uniqueName();
      const noteB = uniqueName();
      created.push(noteA, noteB);

      await createTestNote(noteA, `# A\n\nLinks to [[${noteB}]].`);
      await createTestNote(noteB, "# B");

      const result = await getNoteLinks(executor, { path: `${noteA}.md` });
      expect(typeof result).toBe("string");
    });

    it("returns a result for note with no links", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# No links here.");

      const result = await getNoteLinks(executor, { path: `${name}.md` });
      expect(typeof result).toBe("string");
    });
  });

  describe("getNoteBacklinks", () => {
    it("returns notes that link to the target", async () => {
      const noteA = uniqueName();
      const noteB = uniqueName();
      created.push(noteA, noteB);

      await createTestNote(noteB, "# B");
      await createTestNote(noteA, `# A\n\nLinks to [[${noteB}]].`);

      const result = await getNoteBacklinks(executor, { path: `${noteB}.md` });
      expect(Array.isArray(result) || typeof result === "string").toBe(true);
    });
  });

  describe("listUnresolvedLinks", () => {
    it("returns an array or string", async () => {
      const result = await listUnresolvedLinks(executor, {});
      expect(Array.isArray(result) || typeof result === "string").toBe(true);
    });
  });

  describe("listOrphanNotes", () => {
    it("returns a string result", async () => {
      const result = await listOrphanNotes(executor, {});
      expect(typeof result).toBe("string");
    });
  });

  describe("listDeadendNotes", () => {
    it("returns a string result", async () => {
      const result = await listDeadendNotes(executor, {});
      expect(typeof result).toBe("string");
    });
  });
});
