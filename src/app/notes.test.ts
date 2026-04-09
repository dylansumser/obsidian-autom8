import { describe, it, expect, afterEach } from "vitest";
import { executor, uniqueName, deleteTestNote } from "../../test/setup.js";
import { buildFrontmatter } from "../../test/setup.js";
import {
  readNote,
  createNote,
  editNote,
  appendToNote,
  prependToNote,
  deleteNote,
  moveNote,
  renameNote,
  getNoteOutline,
  getNoteWordcount,
} from "./notes.js";

describe("notes", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  describe("readNote", () => {
    it("reads a note's content", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        path: `${name}.md`,
        content: "# Hello\n\nSome content.",
      });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.content).toContain("# Hello");
      expect(result.content).toContain("Some content.");
    });

    it("returns empty properties when note has no frontmatter", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { path: `${name}.md`, content: "# Plain" });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.properties).toEqual({});
      expect(result.content).toContain("# Plain");
    });

    it("parses YAML frontmatter into properties", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        path: `${name}.md`,
        content: "# Body",
        properties: { status: "active", priority: 1 },
      });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.properties).toMatchObject({ status: "active", priority: 1 });
      expect(result.content).toContain("# Body");
    });

    it("throws when note does not exist", async () => {
      await expect(readNote(executor, { path: "nonexistent-note-xyz-abc.md" })).rejects.toThrow();
    });
  });

  describe("createNote", () => {
    it("creates a plain note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { path: `${name}.md`, content: "# Plain" });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.content).toContain("# Plain");
    });

    it("creates a note with frontmatter via properties", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        path: `${name}.md`,
        content: "# Body",
        properties: { status: "active", priority: 1, tags: ["work", "mcp"] },
      });

      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.properties).toMatchObject({ status: "active", priority: 1 });
    });

    it("creates a note with frontmatter via buildFrontmatter", async () => {
      const name = uniqueName();
      created.push(name);
      const fm = buildFrontmatter({
        status: "active",
        priority: 1,
        tags: ["work", "mcp"],
      });
      await createNote(executor, {
        path: `${name}.md`,
        content: `${fm}\n\n# Body`,
      });

      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.properties).toMatchObject({ status: "active", priority: 1 });
    });
  });

  describe("editNote", () => {
    it("replaces a block of text in a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { path: `${name}.md`, content: "# Hello\n\nOriginal content." });
      await editNote(executor, {
        path: `${name}.md`,
        old_string: "Original content.",
        new_string: "Replaced content.",
      });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.content).toContain("Replaced content.");
      expect(result.content).not.toContain("Original content.");
    });

    it("throws when old_string is not found", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { path: `${name}.md`, content: "# Hello" });
      await expect(
        editNote(executor, {
          path: `${name}.md`,
          old_string: "This text does not exist.",
          new_string: "Replacement.",
        }),
      ).rejects.toThrow("old_string not found");
    });

    it("throws when old_string matches multiple occurrences", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        path: `${name}.md`,
        content: "repeat repeat repeat",
      });
      await expect(
        editNote(executor, {
          path: `${name}.md`,
          old_string: "repeat",
          new_string: "REPLACED",
        }),
      ).rejects.toThrow("matches 3 occurrences");
    });
  });

  describe("appendToNote", () => {
    it("appends content to a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { path: `${name}.md`, content: "# Note" });
      await appendToNote(executor, { path: `${name}.md`, content: "Appended line." });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.content).toContain("# Note");
      expect(result.content).toContain("Appended line.");
    });
  });

  describe("prependToNote", () => {
    it("prepends content to a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { path: `${name}.md`, content: "# Note" });
      await prependToNote(executor, { path: `${name}.md`, content: "Prepended line." });
      const result = await readNote(executor, { path: `${name}.md` });
      expect(result.content).toContain("Prepended line.");
    });
  });

  describe("deleteNote", () => {
    it("deletes a note permanently", async () => {
      const name = uniqueName();
      await createNote(executor, { path: `${name}.md`, content: "# To delete" });
      await deleteNote(executor, { path: `${name}.md`, permanent: true });
      await expect(readNote(executor, { path: `${name}.md` })).rejects.toThrow();
    });
  });

  describe("moveNote", () => {
    it("moves a note to a new path", async () => {
      const name = uniqueName();
      const newName = uniqueName("moved");
      const destination = `${newName}.md`;
      created.push(newName);
      await createNote(executor, { path: `${name}.md`, content: "# To move" });
      await moveNote(executor, { path: `${name}.md`, destination });
    });
  });

  describe("renameNote", () => {
    it("renames a note", async () => {
      const name = uniqueName();
      const newName = uniqueName("renamed");
      created.push(newName);
      await createNote(executor, { path: `${name}.md`, content: "# To rename" });
      await renameNote(executor, { path: `${name}.md`, name: newName });
      const result = await readNote(executor, { path: `${newName}.md` });
      expect(result.content).toContain("# To rename");
    });
  });

  describe("getNoteOutline", () => {
    it("returns headings from a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        path: `${name}.md`,
        content: "# Heading 1\n\n## Heading 2\n\nsome text",
      });
      const result = await getNoteOutline(executor, { path: `${name}.md` });
      const str = JSON.stringify(result);
      expect(str).toContain("Heading 1");
    });
  });

  describe("getNoteWordcount", () => {
    it("returns a word count string", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        path: `${name}.md`,
        content: "one two three four five",
      });
      const result = await getNoteWordcount(executor, { path: `${name}.md` });
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
