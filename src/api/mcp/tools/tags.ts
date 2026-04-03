import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listTagsSchema,
  listTags,
  getTagInfoSchema,
  getTagInfo,
  listAliasesSchema,
  listAliases,
} from "../../../app/tags.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_tags",
    {
      description: "List all tags used in the vault, or just the tags on a specific note.",
      inputSchema: listTagsSchema.shape,
    },
    async (input) => text(await listTags(executor, input)),
  );

  server.registerTool(
    "get_tag_info",
    {
      description: "Get details for a specific tag: occurrence count and list of files using it.",
      inputSchema: getTagInfoSchema.shape,
    },
    async (input) => text(await getTagInfo(executor, input)),
  );

  server.registerTool(
    "list_aliases",
    {
      description:
        "List all aliases defined in frontmatter across the vault, or for a specific note.",
      inputSchema: listAliasesSchema.shape,
    },
    async (input) => text(await listAliases(executor, input)),
  );
}
