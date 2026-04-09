import { describe, it, expect, afterEach } from "vitest";
import { ObsidianExecutor } from "./executor.js";
import { TEST_VAULT, uniqueName, deleteTestNote } from "../../test/setup.js";

const executor = ObsidianExecutor.getInstance(TEST_VAULT);

describe("ObsidianExecutor", () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const name of created.splice(0)) await deleteTestNote(name);
  });

  it("runs a basic CLI command and returns output", async () => {
    const result = await executor.run("version");
    expect(result).toMatch(/\d+\.\d+/);
  });

  it("targets the configured vault", async () => {
    const result = await executor.run("vault", { info: "name" });
    expect(result).toBe(TEST_VAULT);
  });

  it("serialises concurrent calls — results arrive in order", async () => {
    const names = [uniqueName(), uniqueName(), uniqueName()];
    created.push(...names);

    const results = await Promise.all(
      names.map((name) => executor.run("create", { path: `${name}.md`, content: `# ${name}` })),
    );

    expect(results).toHaveLength(3);
    for (const r of results) expect(r).toContain("Created:");
  });

  it("parses JSON output with runJson", async () => {
    const name = uniqueName();
    created.push(name);
    await executor.run("create", {
      path: `${name}.md`,
      content: "---\ntags: [mcp-test]\n---\n# Tagged",
    });
    const result = await executor.runJson("tags");
    expect(Array.isArray(result)).toBe(true);
    expect(result as unknown[]).toEqual(
      expect.arrayContaining([expect.objectContaining({ tag: "#mcp-test" })]),
    );
  });

  it("returns raw string when output is not JSON", async () => {
    const name = uniqueName();
    created.push(name);
    await executor.run("create", { path: `${name}.md`, content: "# Hello" });
    const result = await executor.runJson("read", { path: `${name}.md` });
    expect(typeof result).toBe("string");
    expect(result).toContain("Hello");
  });

  it("rejects with an error on invalid command", async () => {
    await expect(executor.run("nonexistent-command")).rejects.toThrow();
  });

  it("continues processing after an error in the queue", async () => {
    await expect(executor.run("nonexistent-command")).rejects.toThrow();
    const result = await executor.run("version");
    expect(result).toMatch(/\d+\.\d+/);
  });

  it("resolves vault path via CLI", async () => {
    const vaultPath = await executor.resolveVaultPath();
    expect(typeof vaultPath).toBe("string");
    expect(vaultPath.length).toBeGreaterThan(0);
  });
});
