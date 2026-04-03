import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listCommandsSchema,
  listCommands,
  executeCommandSchema,
  executeCommand,
} from "../../../app/commands.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_commands",
    {
      description:
        "List all available Obsidian commands, including those from installed plugins. " +
        "Use this to discover plugin command IDs before calling execute_command.",
      inputSchema: listCommandsSchema.shape,
    },
    async (input) => text(await listCommands(executor, input)),
  );

  server.registerTool(
    "execute_command",
    {
      description:
        "Execute an Obsidian command by its ID. Useful for triggering plugin actions " +
        "such as linting, formatting, or other plugin-provided operations. " +
        "Use list_commands to find available command IDs.",
      inputSchema: executeCommandSchema.shape,
    },
    async (input) => text(await executeCommand(executor, input)),
  );
}
