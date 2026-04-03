import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listBasesSchema,
  listBases,
  listBaseViewsSchema,
  listBaseViews,
  listBasePropertiesSchema,
  listBaseProperties,
  queryBaseSchema,
  queryBase,
  createBaseItemSchema,
  createBaseItem,
} from "../../../app/bases.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_bases",
    {
      description: "List all Bases (database views) in the vault.",
      inputSchema: listBasesSchema.shape,
    },
    async (input) => text(await listBases(executor, input)),
  );

  server.registerTool(
    "list_base_views",
    {
      description:
        "List the views defined in a Base file by parsing its YAML directly. " +
        "Returns each view's name, type, and column order. Stateless — does not " +
        "require the base to be open in Obsidian.",
      inputSchema: listBaseViewsSchema.shape,
    },
    async (input) => text(await listBaseViews(executor, input)),
  );

  server.registerTool(
    "list_base_properties",
    {
      description:
        "List the properties and formulas declared in a Base file by parsing its YAML directly. " +
        "Returns declared properties (with display names) and formula definitions. Stateless.",
      inputSchema: listBasePropertiesSchema.shape,
    },
    async (input) => text(await listBaseProperties(executor, input)),
  );

  server.registerTool(
    "query_base",
    {
      description: "Query a Base and return matching rows as a JSON array.",
      inputSchema: queryBaseSchema.shape,
    },
    async (input) => text(await queryBase(executor, input)),
  );

  server.registerTool(
    "create_base_item",
    {
      description: "Create a new note item in a Base, optionally within a specific view.",
      inputSchema: createBaseItemSchema.shape,
    },
    async (input) => text(await createBaseItem(executor, input)),
  );
}
