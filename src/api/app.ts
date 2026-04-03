import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { ObsidianExecutor } from "../app/executor.js";
import { checkAuth } from "./auth.js";
import { mcpPlugin } from "./mcp/index.js";

export function createApp(executor: ObsidianExecutor, apiKey?: string): FastifyInstance {
  const app = Fastify({ logger: false });
  app.addHook("onRequest", checkAuth(apiKey));
  app.register(mcpPlugin, { executor });
  return app;
}
