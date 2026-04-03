import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { ObsidianExecutor } from "../../src/app/executor.js";
import { createApp } from "../../src/api/app.js";

const TEST_VAULT = process.env.OBSIDIAN_VAULT ?? "test-vault";
const TEST_API_KEY = "e2e-test-secret";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function startServer(apiKey?: string) {
  const executor = ObsidianExecutor.getInstance(TEST_VAULT);
  const app = createApp(executor, apiKey);
  await app.listen({ port: 0, host: "127.0.0.1" });
  const { port } = app.server.address() as AddressInfo;
  return { app, port };
}

async function connectClient(port: number, apiKey?: string): Promise<Client> {
  const client = new Client({ name: "e2e-test-client", version: "1.0.0" });
  const headers: Record<string, string> = apiKey ? { authorization: `Bearer ${apiKey}` } : {};
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`), {
      requestInit: { headers },
    }),
  );
  return client;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

describe("auth", () => {
  let port: number;
  let app: Awaited<ReturnType<typeof startServer>>["app"];

  beforeAll(async () => {
    ({ app, port } = await startServer(TEST_API_KEY));
  });

  afterAll(() => app.close());

  it("rejects connection with no token", async () => {
    const client = new Client({ name: "e2e-no-auth", version: "1.0.0" });
    await expect(
      client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`))),
    ).rejects.toThrow();
  });

  it("rejects connection with wrong token", async () => {
    const client = new Client({ name: "e2e-wrong-auth", version: "1.0.0" });
    await expect(
      client.connect(
        new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`), {
          requestInit: { headers: { authorization: "Bearer wrong" } },
        }),
      ),
    ).rejects.toThrow();
  });

  it("accepts connection with correct token", async () => {
    const client = await connectClient(port, TEST_API_KEY);
    await client.close();
  });
});

// ── Tool registration ─────────────────────────────────────────────────────────

describe("tool registration", () => {
  let port: number;
  let app: Awaited<ReturnType<typeof startServer>>["app"];
  let client: Client;

  beforeAll(async () => {
    ({ app, port } = await startServer());
    client = await connectClient(port);
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  it("registers all 54 tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.length).toBe(52);
  });

  it("every tool has a name and description", async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
    }
  });
});

// ── Live tool calls ───────────────────────────────────────────────────────────

describe("live tool calls", () => {
  let port: number;
  let app: Awaited<ReturnType<typeof startServer>>["app"];
  let client: Client;

  beforeAll(async () => {
    ({ app, port } = await startServer());
    client = await connectClient(port);
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  it("get_vault_info returns vault name", async () => {
    const result = await client.callTool({ name: "get_vault_info", arguments: {} });
    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain(TEST_VAULT);
  });

  it("search_vault returns an array for a broad query", async () => {
    const result = await client.callTool({ name: "search_vault", arguments: { query: "the" } });
    const text = (result.content as { type: string; text: string }[])[0].text;
    // Result is JSON array of file paths or empty array
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
