import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  getNoteBacklinksSchema,
  getNoteBacklinks,
  getNoteLinksSchema,
  getNoteLinks,
  listUnresolvedLinksSchema,
  listUnresolvedLinks,
  listOrphanNotesSchema,
  listOrphanNotes,
  listDeadendNotesSchema,
  listDeadendNotes,
} from "../../../app/graph.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "get_note_backlinks",
    {
      description:
        "List all notes that link to a given note. Returns a JSON array of source file paths.",
      inputSchema: getNoteBacklinksSchema.shape,
    },
    async (input) => text(await getNoteBacklinks(executor, input)),
  );

  server.registerTool(
    "get_note_links",
    {
      description:
        "List all outgoing links from a note. Returns a JSON array of linked file paths.",
      inputSchema: getNoteLinksSchema.shape,
    },
    async (input) => text(await getNoteLinks(executor, input)),
  );

  server.registerTool(
    "list_unresolved_links",
    {
      description: "List all wikilinks in the vault that point to non-existent notes.",
      inputSchema: listUnresolvedLinksSchema.shape,
    },
    async (input) => text(await listUnresolvedLinks(executor, input)),
  );

  server.registerTool(
    "list_orphan_notes",
    {
      description: "List notes with no incoming links — nothing in the vault links to them.",
      inputSchema: listOrphanNotesSchema.shape,
    },
    async (input) => text(await listOrphanNotes(executor, input)),
  );

  server.registerTool(
    "list_deadend_notes",
    {
      description: "List notes with no outgoing links — they link to nothing else in the vault.",
      inputSchema: listDeadendNotesSchema.shape,
    },
    async (input) => text(await listDeadendNotes(executor, input)),
  );
}
