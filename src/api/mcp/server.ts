import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ObsidianExecutor } from "../../app/executor.js";
import { registerTools as registerNotes } from "./tools/notes.js";
import { registerTools as registerSearch } from "./tools/search.js";
import { registerTools as registerProperties } from "./tools/properties.js";
import { registerTools as registerDaily } from "./tools/daily.js";
import { registerTools as registerTasks } from "./tools/tasks.js";
import { registerTools as registerGraph } from "./tools/graph.js";
import { registerTools as registerTags } from "./tools/tags.js";
import { registerTools as registerTemplates } from "./tools/templates.js";
import { registerTools as registerVault } from "./tools/vault.js";
import { registerTools as registerBookmarks } from "./tools/bookmarks.js";
import { registerTools as registerBases } from "./tools/bases.js";
import { registerTools as registerCommands } from "./tools/commands.js";
import { registerTools as registerHistory } from "./tools/history.js";

export function createMcpServer(executor: ObsidianExecutor): McpServer {
  const server = new McpServer({
    name: "obsidian-autom8",
    version: "1.0.0",
  });

  registerNotes(server, executor);
  registerSearch(server, executor);
  registerProperties(server, executor);
  registerDaily(server, executor);
  registerTasks(server, executor);
  registerGraph(server, executor);
  registerTags(server, executor);
  registerTemplates(server, executor);
  registerVault(server, executor);
  registerBookmarks(server, executor);
  registerBases(server, executor);
  registerCommands(server, executor);
  registerHistory(server, executor);
  return server;
}
