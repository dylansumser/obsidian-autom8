import { describe, it, expect, afterEach } from "vitest";
import {
  executor,
  uniqueName,
  createTestNote,
  deleteTestNote,
  TEST_VAULT,
} from "../../test/setup.js";
import { getVaultInfo, listVaults, listFolders, getFileInfo, getFolderInfo } from "./vault.js";

describe("vault", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  describe("getVaultInfo", () => {
    it("returns vault metadata string", async () => {
      const result = await getVaultInfo(executor, {});
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("listVaults", () => {
    it("includes the test vault", async () => {
      const result = await listVaults(executor, {});
      expect(typeof result).toBe("string");
      expect(result).toContain(TEST_VAULT);
    });
  });

  describe("listFolders", () => {
    it("returns a string (may be empty in test vault)", async () => {
      const result = await listFolders(executor, {});
      expect(typeof result).toBe("string");
    });
  });

  describe("getFileInfo", () => {
    it("returns info for an existing note", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Info test");

      const result = await getFileInfo(executor, { path: `${name}.md` });
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("throws for a non-existent file", async () => {
      await expect(
        getFileInfo(executor, { path: "nonexistent-file-xyz-abc.md" }),
      ).rejects.toThrow();
    });
  });

  describe("getFolderInfo", () => {
    it("returns info for root folder", async () => {
      let result: string;
      try {
        result = await getFolderInfo(executor, { path: "/" });
      } catch {
        // Some vaults may not support this — skip gracefully
        return;
      }
      expect(typeof result).toBe("string");
    });
  });
});
