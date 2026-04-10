# Roadmap & planned additions

## Self-documenting REST API

A structured HTTP API for deterministic, non-agent use cases. Unlike the MCP interface — which is designed for LLM tool-calling — the REST API will expose the same operations as predictable, typed endpoints suitable for direct integration with automation platforms, scripts, and workflows that don't involve an AI model in the loop. The API will be self-documenting via OpenAPI.

## n8n custom node

A native [n8n](https://n8n.io) node built on top of the REST API, allowing self-hosted n8n instances to read and write Obsidian vaults as first-class workflow steps — no HTTP Request node configuration required.

## Bun migration (under consideration)

We're evaluating a rewrite of the MCP server runtime from Node.js to [Bun](https://bun.sh). Bun can compile TypeScript to a self-contained executable with no external runtime dependency, which would eliminate the Node.js install step from the Dockerfile entirely. This would meaningfully reduce the final image size and simplify the build process. The API surface and source code structure would remain unchanged — it's a runtime swap, not a rewrite.
