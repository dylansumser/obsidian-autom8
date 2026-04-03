import type { FastifyRequest, FastifyReply } from "fastify";

export function checkAuth(apiKey: string | undefined) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url.startsWith("/.well-known/")) return;
    if (!apiKey) return;
    if (request.headers["authorization"] !== `Bearer ${apiKey}`) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  };
}
