import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  readDailyNoteSchema,
  readDailyNote,
  appendToDailyNoteSchema,
  appendToDailyNote,
  prependToDailyNoteSchema,
  prependToDailyNote,
  getDailyNotePathSchema,
  getDailyNotePath,
} from "../../../app/daily.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "read_daily_note",
    {
      description: "Read the content of today's daily note. Creates it if it does not exist yet.",
      inputSchema: readDailyNoteSchema.shape,
    },
    async (input) => text(await readDailyNote(executor, input)),
  );

  server.registerTool(
    "append_to_daily_note",
    {
      description: "Append content to today's daily note. Creates it if it does not exist yet.",
      inputSchema: appendToDailyNoteSchema.shape,
    },
    async (input) => text(await appendToDailyNote(executor, input)),
  );

  server.registerTool(
    "prepend_to_daily_note",
    {
      description: "Prepend content to today's daily note. Creates it if it does not exist yet.",
      inputSchema: prependToDailyNoteSchema.shape,
    },
    async (input) => text(await prependToDailyNote(executor, input)),
  );

  server.registerTool(
    "get_daily_note_path",
    {
      description: "Get the file path of today's daily note (does not create it).",
      inputSchema: getDailyNotePathSchema.shape,
    },
    async (input) => text(await getDailyNotePath(executor, input)),
  );
}
