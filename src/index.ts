import { parseArgs } from "node:util";
import { ObsidianExecutor } from "./app/executor.js";
import { createApp } from "./api/app.js";

const { values } = parseArgs({
  options: {
    port: { type: "string", default: "3001" },
    "api-key": { type: "string" },
    vault: { type: "string" },
  },
});

const apiKey = values["api-key"] ?? process.env.OBSIDIAN_MCP_API_KEY;
const vault = values.vault ?? process.env.OBSIDIAN_VAULT;
const port = parseInt(values.port ?? "3001", 10);

if (!apiKey) {
  console.warn("[obsidian-autom8] WARNING: No API key configured — server is unauthenticated");
}

async function main() {
  const executor = ObsidianExecutor.getInstance(vault);
  const app = createApp(executor, apiKey);

  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`[obsidian-autom8] Listening on port ${port}`);
    if (vault) console.log(`[obsidian-autom8] Default vault: ${vault}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    console.log("[obsidian-autom8] Shutting down...");
    await app.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[obsidian-autom8] FATAL ERROR:", err);
  process.exit(1);
});
