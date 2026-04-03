import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listTasksSchema,
  listTasks,
  toggleTaskSchema,
  toggleTask,
  setTaskStatusSchema,
  setTaskStatus,
} from "../../../app/tasks.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_tasks",
    {
      description:
        "List tasks across the vault or within a specific note. " +
        "Returns a JSON array of task objects with status and location.",
      inputSchema: listTasksSchema.shape,
    },
    async (input) => text(await listTasks(executor, input)),
  );

  server.registerTool(
    "toggle_task",
    {
      description: "Toggle a task between done and not-done at a specific line.",
      inputSchema: toggleTaskSchema.shape,
    },
    async (input) => text(await toggleTask(executor, input)),
  );

  server.registerTool(
    "set_task_status",
    {
      description: "Set the status character of a task at a specific line e.g. '/', 'x', '-'.",
      inputSchema: setTaskStatusSchema.shape,
    },
    async (input) => text(await setTaskStatus(executor, input)),
  );
}
