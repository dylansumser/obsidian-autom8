import { describe, it, expect, afterEach } from "vitest";
import { executor, uniqueName, deleteTestNote } from "../../test/setup.js";
import { buildFrontmatter } from "../../test/setup.js";
import {
  readNote,
  createNote,
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
        name,
        content: "# Hello\n\nSome content.",
        overwrite: true,
      });
      const result = await readNote(executor, { file: name });
      expect(result).toContain("# Hello");
      expect(result).toContain("Some content.");
    });

    it("throws when note does not exist", async () => {
      await expect(readNote(executor, { file: "nonexistent-note-xyz-abc" })).rejects.toThrow();
    });
  });

  describe("createNote", () => {
    it("creates a plain note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { name, content: "# Plain", overwrite: true });
      const content = await readNote(executor, { file: name });
      expect(content).toContain("# Plain");
    });

    it("creates a note with frontmatter via properties", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        name,
        content: "# Body",
        properties: { status: "active", priority: 1, tags: ["work", "mcp"] },
        overwrite: true,
      });

      const content = await readNote(executor, { file: name });
      expect(content).toContain("status: active");
      expect(content).toContain("priority: 1");
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
        name,
        content: `${fm}\n\n# Body`,
        overwrite: true,
      });

      const content = await readNote(executor, { file: name });
      expect(content).toContain("status: active");
      expect(content).toContain("priority: 1");
    });

    it("overwrites an existing note when overwrite=true", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        name,
        content: "# Original",
        overwrite: true,
      });
      await createNote(executor, {
        name,
        content: "# Replaced",
        overwrite: true,
      });
      const result = await readNote(executor, { file: name });
      expect(result).toContain("# Replaced");
      expect(result).not.toContain("# Original");
    });
  });

  describe("appendToNote", () => {
    it("appends content to a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { name, content: "# Note", overwrite: true });
      await appendToNote(executor, { file: name, content: "Appended line." });
      const result = await readNote(executor, { file: name });
      expect(result).toContain("# Note");
      expect(result).toContain("Appended line.");
    });
  });

  describe("prependToNote", () => {
    it("prepends content to a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, { name, content: "# Note", overwrite: true });
      await prependToNote(executor, { file: name, content: "Prepended line." });
      const result = await readNote(executor, { file: name });
      expect(result).toContain("Prepended line.");
    });
  });

  describe("deleteNote", () => {
    it("deletes a note permanently", async () => {
      const name = uniqueName();
      await createNote(executor, {
        name,
        content: "# To delete",
        overwrite: true,
      });
      await deleteNote(executor, { file: name, permanent: true });
      await expect(readNote(executor, { file: name })).rejects.toThrow();
    });
  });

  describe("moveNote", () => {
    it("moves a note to a new path", async () => {
      const name = uniqueName();
      const newName = uniqueName("moved");
      const destination = `${newName}.md`;
      created.push(newName);
      await createNote(executor, {
        name,
        content: "# To move",
        overwrite: true,
      });
      await moveNote(executor, { file: name, destination });
    });
  });

  describe("renameNote", () => {
    it("renames a note", async () => {
      const name = uniqueName();
      const newName = uniqueName("renamed");
      created.push(newName);
      await createNote(executor, {
        name,
        content: "# To rename",
        overwrite: true,
      });
      await renameNote(executor, { file: name, name: newName });
      const result = await readNote(executor, { file: newName });
      expect(result).toContain("# To rename");
    });
  });

  describe("getNoteOutline", () => {
    it("returns headings from a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        name,
        content: "# Heading 1\n\n## Heading 2\n\nsome text",
        overwrite: true,
      });
      const result = await getNoteOutline(executor, { file: name });
      const str = JSON.stringify(result);
      expect(str).toContain("Heading 1");
    });
  });

  describe("getNoteWordcount", () => {
    it("returns a word count string", async () => {
      const name = uniqueName();
      created.push(name);
      await createNote(executor, {
        name,
        content: "one two three four five",
        overwrite: true,
      });
      const result = await getNoteWordcount(executor, { file: name });
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
