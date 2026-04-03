import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  searchVaultSchema,
  searchVault,
  searchVaultContextSchema,
  searchVaultContext,
  listFilesSchema,
  listFiles,
} from "../../../app/search.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "search_vault",
    {
      description:
        "Search vault content for a text query. Returns matching file paths as a JSON array.",
      inputSchema: searchVaultSchema.shape,
    },
    async (input) => text(await searchVault(executor, input)),
  );

  server.registerTool(
    "search_vault_context",
    {
      description:
        "Search vault content and return matching lines with surrounding context. " +
        "More expensive than search_vault but shows where matches appear.",
      inputSchema: searchVaultContextSchema.shape,
    },
    async (input) => text(await searchVaultContext(executor, input)),
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
