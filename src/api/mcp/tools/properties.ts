import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listPropertiesSchema,
  listProperties,
  getPropertySchema,
  getProperty,
  setPropertySchema,
  setProperty,
  removePropertySchema,
  removeProperty,
} from "../../../app/properties.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_properties",
    {
      description:
        "List all frontmatter properties in the vault, or just for a specific note. " +
        "Returns property names, types, and occurrence counts.",
      inputSchema: listPropertiesSchema.shape,
    },
    async (input) => text(await listProperties(executor, input)),
  );

  server.registerTool(
    "get_property",
    {
      description: "Read the value of a single frontmatter property from a note.",
      inputSchema: getPropertySchema.shape,
    },
    async (input) => text(await getProperty(executor, input)),
  );

  server.registerTool(
    "set_property",
    {
      description:
        "Set a frontmatter property on a note. Creates the property if it does not exist.",
      inputSchema: setPropertySchema.shape,
    },
    async (input) => text(await setProperty(executor, input)),
  );

  server.registerTool(
    "remove_property",
    {
      description: "Remove a frontmatter property from a note.",
      inputSchema: removePropertySchema.shape,
    },
    async (input) => text(await removeProperty(executor, input)),
  );
}
