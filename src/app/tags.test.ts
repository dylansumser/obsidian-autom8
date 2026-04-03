import { describe, it, expect, afterEach } from "vitest";
import { executor, uniqueName, createTestNote, deleteTestNote } from "../../test/setup.js";
import { listTags, getTagInfo, listAliases } from "./tags.js";

describe("tags", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  describe("listTags", () => {
    it("returns tags from the vault", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Tagged\n\n#test-mcp-tag");

      const result = await listTags(executor, { file: name });
      expect(Array.isArray(result) || typeof result === "object").toBe(true);
    });
  });

  describe("getTagInfo", () => {
    it("returns info for a tag", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Tagged\n\n#test-mcp-tag");

      const result = await getTagInfo(executor, { name: "test-mcp-tag" });
      expect(typeof result).toBe("string");
    });
  });

  describe("listAliases", () => {
    it("returns aliases from the vault", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Note with alias", {
        aliases: ["my-alias"],
      });

      const result = await listAliases(executor, {});
      expect(typeof result).toBe("string");
    });
  });
});
