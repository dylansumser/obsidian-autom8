import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const taskItemSchema = z.object({
  status: z.string(),
  text: z.string(),
  file: z.string(),
  line: z.string(),
});
export type TaskItem = z.infer<typeof taskItemSchema>;

export const listTasksSchema = z.object({
  path: z.string().optional().describe("Filter by exact file path"),
  done: z.boolean().optional().describe("Show only completed tasks"),
  todo: z.boolean().optional().describe("Show only incomplete tasks"),
  status: z.string().optional().describe("Filter by custom status character e.g. '/'"),
  verbose: z.boolean().optional().describe("Group results by file with line numbers"),
});

export const toggleTaskSchema = z.object({
  line: z.number().describe("1-based line number of the task"),
  path: z.string().describe("Exact file path"),
});

export const setTaskStatusSchema = z.object({
  line: z.number().describe("1-based line number of the task"),
  status: z.string().describe("Status character to set"),
  path: z.string().describe("Exact file path"),
});

export async function listTasks(
  executor: ObsidianExecutor,
  input: z.infer<typeof listTasksSchema>,
): Promise<TaskItem[]> {
  const raw = await executor.runJson("tasks", {
    path: input.path,
    done: input.done,
    todo: input.todo,
    status: input.status,
    verbose: input.verbose,
  });
  return z.array(taskItemSchema).parse(raw);
}

export async function toggleTask(
  executor: ObsidianExecutor,
  input: z.infer<typeof toggleTaskSchema>,
): Promise<void> {
  await executor.run("task", { line: input.line, path: input.path, toggle: true });
}

export async function setTaskStatus(
  executor: ObsidianExecutor,
  input: z.infer<typeof setTaskStatusSchema>,
): Promise<void> {
  await executor.run("task", { line: input.line, status: input.status, path: input.path });
}
