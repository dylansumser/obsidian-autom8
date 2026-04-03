import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { executor, uniqueName, deleteTestNote, buildFrontmatter } from "../../test/setup.js";
import { listProperties, getProperty, setProperty, removeProperty } from "./properties.js";

describe("properties", () => {
  let noteName: string;

  beforeEach(async () => {
    noteName = uniqueName("props");
    const fm = buildFrontmatter({
      status: "draft",
      count: 3,
      tags: ["a", "b"],
    });
    await executor.run("create", {
      name: noteName,
      content: `${fm}\n\n# Body`,
      overwrite: true,
    });
  });

  afterEach(async () => {
    await deleteTestNote(noteName);
  });

  describe("listProperties", () => {
    it("returns JSON array of vault-wide properties", async () => {
      const result = await listProperties(executor, {});
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns properties for a specific file", async () => {
      const result = await listProperties(executor, { file: noteName });
      const str = JSON.stringify(result);
      expect(str).toContain("status");
    });
  });

  describe("getProperty", () => {
    it("reads a string property", async () => {
      const result = await getProperty(executor, {
        file: noteName,
        name: "status",
      });
      expect(result).toBe("draft");
    });

    it("reads a numeric property", async () => {
      const result = await getProperty(executor, {
        file: noteName,
        name: "count",
      });
      expect(result).toBe("3");
    });
  });

  describe("setProperty", () => {
    it("updates an existing property", async () => {
      await setProperty(executor, {
        file: noteName,
        name: "status",
        value: "published",
      });
      const result = await getProperty(executor, {
        file: noteName,
        name: "status",
      });
      expect(result).toBe("published");
    });

    it("creates a new property", async () => {
      await setProperty(executor, {
        file: noteName,
        name: "author",
        value: "test-agent",
      });
      const result = await getProperty(executor, {
        file: noteName,
        name: "author",
      });
      expect(result).toBe("test-agent");
    });
  });

  describe("removeProperty", () => {
    it("removes a property from a note", async () => {
      await removeProperty(executor, { file: noteName, name: "status" });
      await expect(getProperty(executor, { file: noteName, name: "status" })).rejects.toThrow();
    });
  });
});
