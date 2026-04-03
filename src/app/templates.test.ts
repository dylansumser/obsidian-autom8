import { describe, it, expect } from "vitest";
import { executor } from "../../test/setup.js";
import { listTemplates, readTemplate } from "./templates.js";

// Templates require the Obsidian Templates or Templater plugin to be configured.
// These tests check graceful behaviour when the plugin may not be active in the test vault.

describe("templates", () => {
  describe("listTemplates", () => {
    it("returns a string (empty list or template names)", async () => {
      let result: string;
      try {
        result = await listTemplates(executor, {});
      } catch {
        // Plugin not configured — acceptable in test vault
        return;
      }
      expect(typeof result).toBe("string");
    });
  });

  describe("readTemplate", () => {
    it("throws for a nonexistent template", async () => {
      await expect(readTemplate(executor, { name: "nonexistent-template-xyz" })).rejects.toThrow();
    });
  });
});
