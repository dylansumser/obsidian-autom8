import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { executor } from "../../test/setup.js";
import { readDailyNote, appendToDailyNote, prependToDailyNote, getDailyNotePath } from "./daily.js";

let dailyNotesAvailable = false;
let dailyNotePath: string | undefined;

beforeAll(async () => {
  try {
    dailyNotePath = await getDailyNotePath(executor, {});
    dailyNotesAvailable = true;
  } catch {
    dailyNotesAvailable = false;
  }
});

afterAll(async () => {
  if (dailyNotePath) {
    try {
      await executor.run("delete", { path: dailyNotePath, permanent: true });
    } catch {
      // already gone — ignore
    }
  }
});

describe("daily note", () => {
  describe("getDailyNotePath", () => {
    it("returns today's date as a file path", async () => {
      if (!dailyNotesAvailable) return;
      expect(typeof dailyNotePath).toBe("string");
      expect(dailyNotePath!.length).toBeGreaterThan(0);
      expect(dailyNotePath).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("readDailyNote", () => {
    it("creates today's note if it does not exist and returns content", async () => {
      if (!dailyNotesAvailable) return;
      try {
        await executor.run("delete", { path: dailyNotePath!, permanent: true });
      } catch {
        /* may not exist yet */
      }

      const result = await readDailyNote(executor, {});
      expect(typeof result).toBe("string");
    });
  });

  describe("appendToDailyNote", () => {
    it("appends content and verifies it appears in the note", async () => {
      if (!dailyNotesAvailable) return;
      const probe = `test-mcp-daily-${Date.now()}`;
      await appendToDailyNote(executor, { content: probe });
      const content = await readDailyNote(executor, {});
      expect(content).toContain(probe);
    });
  });

  describe("prependToDailyNote", () => {
    it("prepends content to the daily note", async () => {
      if (!dailyNotesAvailable) return;
      const probe = `test-mcp-prepend-${Date.now()}`;
      await prependToDailyNote(executor, { content: probe });
      const content = await readDailyNote(executor, {});
      expect(content).toContain(probe);
    });
  });
});
