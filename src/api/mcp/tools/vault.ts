import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  getVaultInfoSchema,
  getVaultInfo,
  listVaultsSchema,
  listVaults,
  listFoldersSchema,
  listFolders,
  getFileInfoSchema,
  getFileInfo,
  getFolderInfoSchema,
  getFolderInfo,
} from "../../../app/vault.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "get_vault_info",
    {
      description: "Get metadata about the current vault (name, path, plugin list).",
      inputSchema: getVaultInfoSchema.shape,
    },
    async (input) => text(await getVaultInfo(executor, input)),
  );

  server.registerTool(
    "list_vaults",
    {
      description: "List all vaults registered with Obsidian.",
      inputSchema: listVaultsSchema.shape,
    },
    async (input) => text(await listVaults(executor, input)),
  );

  server.registerTool(
    "list_folders",
    {
      description: "List all folders in the vault or within a parent folder.",
      inputSchema: listFoldersSchema.shape,
    },
    async (input) => text(await listFolders(executor, input)),
  );

  server.registerTool(
    "get_file_info",
    {
      description: "Get metadata about a specific file (size, created, modified, path).",
      inputSchema: getFileInfoSchema.shape,
    },
    async (input) => text(await getFileInfo(executor, input)),
  );

  server.registerTool(
    "get_folder_info",
    {
      description: "Get metadata about a folder (file count, subfolders).",
      inputSchema: getFolderInfoSchema.shape,
    },
    async (input) => text(await getFolderInfo(executor, input)),
  );
}
