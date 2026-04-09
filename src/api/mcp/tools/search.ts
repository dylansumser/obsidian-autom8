import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  searchVaultSchema,
  searchVault,
  listFilesSchema,
  listFiles,
} from "../../../app/search.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "search_vault",
    {
      description:
        "Search vault content for a text query. Returns matching file paths by default; set includeContext: true to return matching lines with line numbers (more expensive).",
      inputSchema: searchVaultSchema.shape,
    },
    async (input) => text(await searchVault(executor, input)),
  );

  server.registerTool(
    "list_files",
    {
      description: "List all markdown files in the vault or within a folder.",
      inputSchema: listFilesSchema.shape,
    },
    async (input) => text(await listFiles(executor, input)),
  );
}
