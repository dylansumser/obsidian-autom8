import type { FastifyInstance } from "fastify";
import type { ObsidianExecutor } from "../../app/executor.js";

export async function restPlugin(
  _app: FastifyInstance,
  _options: { executor: ObsidianExecutor },
): Promise<void> {
  // REST routes will be registered here
}
