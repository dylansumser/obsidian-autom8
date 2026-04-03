import { describe, it, expect } from "vitest";
import { executor } from "../../test/setup.js";
import { listCommands, executeCommand } from "./commands.js";

describe("commands", () => {
  describe("listCommands", () => {
    it("returns a non-empty list of command IDs", async () => {
      const result = await listCommands(executor, {});
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("filters by prefix", async () => {
      const result = await listCommands(executor, { filter: "app:" });
      expect(typeof result).toBe("string");
      const lines = result.split("\n").filter(Boolean);
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) {
        expect(line.startsWith("app:")).toBe(true);
      }
    });
  });

  describe("executeCommand", () => {
    it("throws for an unknown command ID", async () => {
      await expect(executeCommand(executor, { id: "nonexistent:command-xyz" })).rejects.toThrow();
    });
  });
});
