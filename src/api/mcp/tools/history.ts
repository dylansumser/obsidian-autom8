import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listHistoryFilesSchema,
  listHistoryFiles,
  listNoteVersionsSchema,
  listNoteVersions,
  readNoteVersionSchema,
  readNoteVersion,
  restoreNoteVersionSchema,
  restoreNoteVersion,
  diffNoteSchema,
  diffNote,
} from "../../../app/history.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_history_files",
    {
      description:
        "List all files that have saved versions in Obsidian's File Recovery history. " +
        "Requires the File Recovery core plugin to be enabled.",
      inputSchema: listHistoryFilesSchema.shape,
    },
    async (input) => text(await listHistoryFiles(executor, input)),
  );

  server.registerTool(
    "list_note_versions",
    {
      description:
        "List all saved history versions for a specific note. " +
        "Returns version numbers and timestamps. Requires the File Recovery core plugin.",
      inputSchema: listNoteVersionsSchema.shape,
    },
    async (input) => text(await listNoteVersions(executor, input)),
  );

  server.registerTool(
    "read_note_version",
    {
      description:
        "Read the content of a specific historical version of a note. " +
        "Version 1 is the most recent snapshot.",
      inputSchema: readNoteVersionSchema.shape,
    },
    async (input) => text(await readNoteVersion(executor, input)),
  );

  server.registerTool(
    "restore_note_version",
    {
      description:
        "Restore a note to a specific historical version, overwriting the current content. " +
        "Use list_note_versions to find the version number.",
      inputSchema: restoreNoteVersionSchema.shape,
    },
    async (input) => text(await restoreNoteVersion(executor, input)),
  );

  server.registerTool(
    "diff_note",
    {
      description:
        "Show a diff between two versions of a note, or between local and sync versions. " +
        "Omit from/to to list all available versions.",
      inputSchema: diffNoteSchema.shape,
    },
    async (input) => text(await diffNote(executor, input)),
  );
}
