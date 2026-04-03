import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listBookmarksSchema,
  listBookmarks,
  addBookmarkSchema,
  addBookmark,
} from "../../../app/bookmarks.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_bookmarks",
    {
      description: "List all bookmarks saved in the vault.",
      inputSchema: listBookmarksSchema.shape,
    },
    async (input) => text(await listBookmarks(executor, input)),
  );

  server.registerTool(
    "add_bookmark",
    {
      description:
        "Add a note to bookmarks. Use path= with the exact filename e.g. 'My Note.md' — fuzzy name match is not supported by the bookmark command.",
      inputSchema: addBookmarkSchema.shape,
    },
    async (input) => text(await addBookmark(executor, input)),
  );
}
