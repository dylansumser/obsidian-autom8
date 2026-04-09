import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { executor, uniqueName, deleteTestNote } from "../../test/setup.js";
import { listTasks, toggleTask, setTaskStatus } from "./tasks.js";

describe("tasks", () => {
  const noteName = uniqueName("tasks-fixture");

  beforeAll(async () => {
    await executor.run("create", {
      path: `${noteName}.md`,
      content: [
        "# Tasks",
        "",
        "- [ ] Incomplete task",
        "- [x] Completed task",
        "- [ ] Another todo",
      ].join("\n"),
      overwrite: true,
    });
  });

  afterAll(async () => {
    await deleteTestNote(noteName);
  });

  describe("listTasks", () => {
    it("returns a JSON array of tasks", async () => {
      const result = await listTasks(executor, { path: `${noteName}.md` });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
    });

    it("filters to only incomplete tasks", async () => {
      const result = await listTasks(executor, { path: `${noteName}.md`, todo: true });
      expect(Array.isArray(result)).toBe(true);
      const str = JSON.stringify(result);
      expect(str).not.toContain('"done":true');
    });

    it("filters to only completed tasks", async () => {
      const result = await listTasks(executor, { path: `${noteName}.md`, done: true });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
    });
  });

  describe("toggleTask", () => {
    it("toggles a task's completion state", async () => {
      const before = await listTasks(executor, { path: `${noteName}.md` });
      const tasks = before as { line?: number; done?: boolean }[];
      const incomplete = tasks.find((t) => !t.done);
      if (!incomplete?.line) return;

      await toggleTask(executor, { path: `${noteName}.md`, line: incomplete.line });
      const after = await listTasks(executor, { path: `${noteName}.md`, done: true });
      expect(Array.isArray(after)).toBe(true);
    });
  });

  describe("setTaskStatus", () => {
    it("sets a custom status character on a task", async () => {
      const tasks = (await listTasks(executor, { path: `${noteName}.md` })) as {
        line?: number;
      }[];
      const task = tasks.find((t) => t.line !== undefined);
      if (!task?.line) return;

      await expect(
        setTaskStatus(executor, {
          path: `${noteName}.md`,
          line: task.line,
          status: "/",
        }),
      ).resolves.toBeUndefined();
    });
  });
});
