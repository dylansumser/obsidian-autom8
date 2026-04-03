import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  listTemplatesSchema,
  listTemplates,
  readTemplateSchema,
  readTemplate,
} from "../../../app/templates.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "list_templates",
    {
      description: "List all available templates in the vault.",
      inputSchema: listTemplatesSchema.shape,
    },
    async (input) => text(await listTemplates(executor, input)),
  );

  server.registerTool(
    "read_template",
    {
      description:
        "Read the content of a template. Optionally resolve template variables " +
        "(e.g. {{date}}, {{title}}) before returning.",
      inputSchema: readTemplateSchema.shape,
    },
    async (input) => text(await readTemplate(executor, input)),
  );
}
