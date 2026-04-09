import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setTimeout as sleep } from "node:timers/promises";
import { executor, uniqueName, createTestNote, deleteTestNote } from "../../test/setup.js";
import {
  listBases,
  listBaseViews,
  listBaseProperties,
  queryBase,
  createBaseItem,
} from "./bases.js";

/**
 * Base schema used across most tests:
 *
 * Global filter: Status == "Active"  (all views)
 * View "All":           all Active notes, columns: file.name, Status, Priority
 * View "High Priority": Active AND Priority == "High"
 * View "Old Files":     file.ctime < today() - "365d"  (immutable property)
 */

const BASE_NAME = "test-mcp-base";
const BASE_FILE = `${BASE_NAME}.base`;

const BASE_YAML = `filters:
  and:
    - 'Status == "Active"'

properties:
  Status:
    displayName: Status
  Priority:
    displayName: Priority

views:
  - type: table
    name: All
    order:
      - file.name
      - Status
      - Priority
  - type: table
    name: High Priority
    filters:
      and:
        - 'Priority == "High"'
    order:
      - file.name
      - Status
      - Priority
  - type: table
    name: Old Files
    filters:
      and:
        - 'file.ctime < today() - "365d"'
    order:
      - file.name
      - file.ctime
`;

beforeAll(async () => {
  await executor.run("create", { path: BASE_FILE, content: BASE_YAML, overwrite: true });
  // Give Obsidian a moment to index the newly written file
  await sleep(2000);
});

afterAll(async () => {
  try {
    await executor.run("delete", { path: BASE_FILE, permanent: true });
  } catch {
    /* already gone */
  }
});

describe("bases", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  // ── Discovery ─────────────────────────────────────────────────────────────

  describe("listBases", () => {
    it("includes the test base file", async () => {
      const result = await listBases(executor, {});
      expect(result).toContain(BASE_FILE);
    });
  });

  // ── YAML-parsed metadata ──────────────────────────────────────────────────

  describe("listBaseViews", () => {
    it("returns all view names and types", async () => {
      const views = await listBaseViews(executor, { path: BASE_FILE });
      const names = views.map((v) => v.name);
      expect(names).toContain("All");
      expect(names).toContain("High Priority");
      expect(names).toContain("Old Files");
    });

    it("includes column order for each view", async () => {
      const views = await listBaseViews(executor, { path: BASE_FILE });
      const allView = views.find((v) => v.name === "All");
      expect(allView?.columns).toContain("file.name");
      expect(allView?.columns).toContain("Status");
    });
  });

  describe("listBaseProperties", () => {
    it("returns declared properties with display names", async () => {
      const { properties } = await listBaseProperties(executor, { path: BASE_FILE });
      const keys = properties.map((p) => p.key);
      expect(keys).toContain("Status");
      expect(keys).toContain("Priority");
      const status = properties.find((p) => p.key === "Status");
      expect(status?.displayName).toBe("Status");
    });

    it("returns formulas (empty for this base)", async () => {
      const { formulas } = await listBaseProperties(executor, { path: BASE_FILE });
      expect(Array.isArray(formulas)).toBe(true);
    });
  });

  // ── Querying — global filter ───────────────────────────────────────────────

  describe("queryBase — global filter", () => {
    it("excludes notes that do not have Status=Active", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# No status");

      const rows = (await queryBase(executor, { path: BASE_FILE })) as Record<string, unknown>[];
      expect(rows.some((r) => String(r["path"] ?? "").includes(name))).toBe(false);
    });

    it("includes notes with Status=Active and exposes their properties", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Active note", {
        Status: "Active",
        Priority: "Low",
      });

      const rows = (await queryBase(executor, { path: BASE_FILE })) as Record<string, unknown>[];
      const match = rows.find((r) => String(r["path"] ?? "").includes(name));
      expect(match).toBeDefined();
      expect(match!["Status"]).toBe("Active");
      expect(match!["Priority"]).toBe("Low");
    });

    it("returns null for properties not set on a note", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Active no priority", { Status: "Active" });

      const rows = (await queryBase(executor, { path: BASE_FILE })) as Record<string, unknown>[];
      const match = rows.find((r) => String(r["path"] ?? "").includes(name));
      expect(match).toBeDefined();
      expect(match!["Priority"]).toBeNull();
    });
  });

  // ── Querying — view-level filter ──────────────────────────────────────────

  describe("queryBase — view-level filter", () => {
    it("High Priority view excludes Active notes with Priority=Low", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# Low priority", {
        Status: "Active",
        Priority: "Low",
      });

      const rows = (await queryBase(executor, {
        path: BASE_FILE,
        view: "High Priority",
      })) as Record<string, unknown>[];
      expect(rows.some((r) => String(r["path"] ?? "").includes(name))).toBe(false);
    });

    it("High Priority view includes Active notes with Priority=High", async () => {
      const name = uniqueName();
      created.push(name);
      await createTestNote(name, "# High priority", {
        Status: "Active",
        Priority: "High",
      });

      const rows = (await queryBase(executor, {
        path: BASE_FILE,
        view: "High Priority",
      })) as Record<string, unknown>[];
      const match = rows.find((r) => String(r["path"] ?? "").includes(name));
      expect(match).toBeDefined();
      expect(match!["Priority"]).toBe("High");
    });
  });

  // ── Creating items — property injection ────────────────────────────────────

  describe("createBaseItem — property injection from filters", () => {
    it("injects Status=Active from global equality filter", async () => {
      const name = uniqueName();
      created.push(name);
      await createBaseItem(executor, { path: BASE_FILE, name });

      const status = await executor.run("property:read", {
        path: `${name}.md`,
        name: "Status",
      });
      expect(status).toBe("Active");
    });

    it("injects Status=Active + Priority=High when creating via High Priority view", async () => {
      const name = uniqueName();
      created.push(name);
      await createBaseItem(executor, {
        path: BASE_FILE,
        name,
        view: "High Priority",
      });

      const status = await executor.run("property:read", {
        path: `${name}.md`,
        name: "Status",
      });
      const priority = await executor.run("property:read", {
        path: `${name}.md`,
        name: "Priority",
      });
      expect(status).toBe("Active");
      expect(priority).toBe("High");
    });

    it("view-created item appears in query results for that view", async () => {
      const name = uniqueName();
      created.push(name);
      await createBaseItem(executor, {
        path: BASE_FILE,
        name,
        view: "High Priority",
      });

      const rows = (await queryBase(executor, {
        path: BASE_FILE,
        view: "High Priority",
      })) as Record<string, unknown>[];
      expect(rows.some((r) => String(r["path"] ?? "").includes(name))).toBe(true);
    });

    it("creates a note with initial content alongside injected properties", async () => {
      const name = uniqueName();
      created.push(name);
      await createBaseItem(executor, {
        path: BASE_FILE,
        name,
        content: "# Created via base",
      });

      const content = await executor.run("read", { path: `${name}.md` });
      expect(content).toContain("Created via base");
      const status = await executor.run("property:read", {
        path: `${name}.md`,
        name: "Status",
      });
      expect(status).toBe("Active");
    });
  });

  // ── Immutable property filters ─────────────────────────────────────────────

  describe("createBaseItem — immutable property filter (file.ctime)", () => {
    it("succeeds without error even though ctime cannot be set", async () => {
      const name = uniqueName();
      created.push(name);
      await expect(
        createBaseItem(executor, { path: BASE_FILE, name, view: "Old Files" }),
      ).resolves.toBeUndefined();
    });
  });
});
