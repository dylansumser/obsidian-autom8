import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";
import { requireOneOf } from "./utils.js";

export const taskItemSchema = z.object({
  status: z.string(),
  text: z.string(),
  file: z.string(),
  line: z.string(),
});
export type TaskItem = z.infer<typeof taskItemSchema>;

export const listTasksSchema = z.object({
  file: z.string().optional().describe("Filter by note name (fuzzy match)"),
  path: z.string().optional().describe("Filter by exact file path"),
  done: z.boolean().optional().describe("Show only completed tasks"),
  todo: z.boolean().optional().describe("Show only incomplete tasks"),
  status: z.string().optional().describe("Filter by custom status character e.g. '/'"),
  verbose: z.boolean().optional().describe("Group results by file with line numbers"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const toggleTaskSchema = z.object({
  line: z.number().describe("1-based line number of the task"),
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const setTaskStatusSchema = z.object({
  line: z.number().describe("1-based line number of the task"),
  status: z.string().describe("Status character to set"),
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listTasks(
  executor: ObsidianExecutor,
  input: z.infer<typeof listTasksSchema>,
): Promise<TaskItem[]> {
  const raw = await executor.runJson(
    "tasks",
    {
      file: input.file,
      path: input.path,
      done: input.done,
      todo: input.todo,
      status: input.status,
      verbose: input.verbose,
    },
    input.vault,
  );
  return z.array(taskItemSchema).parse(raw);
}

export async function toggleTask(
  executor: ObsidianExecutor,
  input: z.infer<typeof toggleTaskSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "task",
    { line: input.line, file: input.file, path: input.path, toggle: true },
    input.vault,
  );
}

export async function setTaskStatus(
  executor: ObsidianExecutor,
  input: z.infer<typeof setTaskStatusSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "task",
    {
      line: input.line,
      status: input.status,
      file: input.file,
      path: input.path,
    },
    input.vault,
  );
}
