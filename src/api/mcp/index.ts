import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { ObsidianExecutor } from "../../app/executor.js";
import { createMcpServer } from "./server.js";

export async function mcpPlugin(
  app: FastifyInstance,
  options: { executor: ObsidianExecutor },
): Promise<void> {
  const { executor } = options;
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  app.addHook("onClose", async () => {
    for (const transport of sessions.values()) await transport.close();
    sessions.clear();
  });

  app.post("/mcp", async (request, reply) => {
    const body = request.body as unknown;
    const sessionId = request.headers["mcp-session-id"] as string | undefined;
    let transport = sessionId ? sessions.get(sessionId) : undefined;

    if (!transport) {
      if (!isInitializeRequest(body)) {
        reply.code(400).send({ error: "Expected initialize request" });
        return;
      }
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
      });
      sessions.set(newSessionId, transport);
      transport.onclose = () => sessions.delete(newSessionId);
      await createMcpServer(executor).connect(transport);
    }

    reply.hijack();
    try {
      await transport.handleRequest(request.raw, reply.raw, body);
    } catch (err) {
      console.error("[obsidian-autom8] MCP POST error:", err);
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(500, { "Content-Type": "application/json" });
        reply.raw.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });

  app.get("/mcp", async (request, reply) => {
    const sessionId = request.headers["mcp-session-id"] as string | undefined;
    const transport = sessionId ? sessions.get(sessionId) : undefined;
    if (!transport) {
      reply.code(404).send({ error: "Session not found" });
      return;
    }

    reply.hijack();
    try {
      await transport.handleRequest(request.raw, reply.raw);
    } catch (err) {
      console.error("[obsidian-autom8] MCP GET error:", err);
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(500, { "Content-Type": "application/json" });
        reply.raw.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });

  app.delete("/mcp", async (request, reply) => {
    const sessionId = request.headers["mcp-session-id"] as string | undefined;
    const transport = sessionId ? sessions.get(sessionId) : undefined;
    if (transport) {
      await transport.close();
      sessions.delete(sessionId!);
    }
    reply.code(204).send();
  });
}
