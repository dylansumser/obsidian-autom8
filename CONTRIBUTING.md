# Contributing to obsidian-autom8

---

## Architecture

obsidian-autom8 layers two components on top of [`lscr.io/linuxserver/obsidian`](https://github.com/linuxserver/docker-obsidian): an MCP server and the Obsidian CLI. The MCP server is written in TypeScript, compiled to a single CJS bundle via esbuild, and registered as an s6-overlay service so it starts and restarts automatically alongside Obsidian.

### Container architecture

```mermaid
graph TD
    subgraph Container
        direction TB
        S6[s6-overlay supervisor]
        OBS[Obsidian app]
        MCP[MCP server\nNode.js / obsidian-autom8.cjs]
        SOCK[Unix socket\n/config/.XDG/.obsidian-cli.sock]
        CLI[obsidian CLI binary\n/config/.local/bin/obsidian]

        S6 --> OBS
        S6 --> MCP
        OBS -- exposes --> SOCK
        MCP -- shells out to --> CLI
        CLI -- connects via --> SOCK
    end

    CLIENT[MCP client\ne.g. Claude Code] -- HTTP Bearer --> MCP
```

### Source code layout

The TypeScript source is split into two layers:

```mermaid
graph LR
    subgraph src/tools/
        T1[notes.ts]
        T2[search.ts]
        T3[tags.ts]
        TN[...etc]
    end

    subgraph src/app/
        A1[notes.ts]
        A2[search.ts]
        A3[tags.ts]
        AN[...etc]
        EX[executor.ts]
    end

    T1 --> A1
    T2 --> A2
    T3 --> A3
    TN --> AN
    A1 & A2 & A3 & AN --> EX
    EX -- shells out --> CLI2[obsidian CLI]
```

| Layer | Path | Responsibility |
|---|---|---|
| MCP adapter | `src/api/mcp/tools/` | Registers tools with the MCP SDK, validates inputs, calls into `src/app/` |
| Business logic | `src/app/` | Builds CLI commands, parses output, owns domain types |
| MCP utilities | `src/api/mcp/tools/utils.ts` | `text()` — wraps values in the MCP tool response envelope |
| Entrypoint | `src/index.ts` | Starts the Fastify HTTP server and mounts the MCP router |
| CLI executor | `src/app/executor.ts` | Shells out to the `obsidian` binary via a serial queue; lazily resolves vault path |

### Request flow

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server (Fastify)
    participant Tool as src/tools/*.ts
    participant App as src/app/*.ts
    participant Exec as executor.ts
    participant CLI as obsidian CLI
    participant Sock as IPC Socket

    Client->>Server: HTTP POST /mcp (tool call)
    Server->>Tool: route to registered tool handler
    Tool->>App: call business logic function
    App->>Exec: build + run CLI command
    Exec->>CLI: spawn process
    CLI->>Sock: connect to Obsidian IPC
    Sock-->>CLI: response
    CLI-->>Exec: stdout
    Exec-->>App: parsed result
    App-->>Tool: typed return value
    Tool-->>Server: MCP tool response envelope
    Server-->>Client: HTTP response
```

---

## Local development

### Prerequisites

- Node.js 24+
- The [Obsidian](https://obsidian.md) desktop app installed and running locally
- The Obsidian CLI enabled: **Settings → General → Command line interface** (this registers the `obsidian` binary at `~/.local/bin/obsidian` or equivalent)
- A local Obsidian vault for testing — open the `test/test-vault/` directory as a vault in Obsidian and keep it active while running tests

### Install dependencies

```bash
npm install
```

### Run the MCP server locally

```bash
npm run dev
```

This starts the server using `tsx` (no build step needed). The server connects to whichever Obsidian vault is currently active on your machine.

### Run tests locally

**Unit tests** (tests the app layer directly via the executor):

```bash
OBSIDIAN_VAULT=test-vault npm run test:unit
```

**Integration tests** (tests the full MCP server HTTP layer end-to-end):

```bash
OBSIDIAN_VAULT=test-vault npm run test:integration
```

**Both:**

```bash
OBSIDIAN_VAULT=test-vault npm test
```

> Both test suites call the live Obsidian IPC socket. Obsidian must be open locally with `test/test-vault/` as the active vault, and the CLI must be enabled. If the socket isn't available, the tests will time out.

### Full CI pipeline locally

To run the exact same pipeline that runs on GitHub Actions, use [act](https://github.com/nektos/act). With Docker running, the full CI workflow can be triggered via:

```bash
npm run test:ci
# equivalent to: act -W '.github/workflows/ci.yml'
```

> On first run, `act` will prompt you to choose a runner image. The `test` job spins up a nested container, so select the `Large` runner image or ensure your Docker setup supports Docker-in-Docker.

### Build

```bash
npm run build
```

This runs `tsc --noEmit` (type check) then esbuild to produce `dist/obsidian-autom8.cjs` — the single-file bundle copied into the Docker image.

---

## CI / CD

### GitHub Actions

```mermaid
flowchart LR
    PUSH[push to main] --> CI

    subgraph CI [ci.yml]
        CHECK[Type check · Lint · Format · Build]
        TEST[Build Docker image\nStart Obsidian container\nRun tests]
        CHECK --> TEST
    end

    subgraph Docker [docker.yml]
        BLDPUSH[Build & push\nlatest · main]
        VERSION{new version\nin package.json?}
        BLDPUSH_V[Build & push\nversioned image\ne.g. 1.1.1 · 1.1]
        RELEASE[Create GitHub release\nauto-generated notes]
        BLDPUSH --> VERSION
        VERSION -->|yes| BLDPUSH_V --> RELEASE
        VERSION -->|no| DONE([no versioned release])
    end

    CI -->|passes| Docker
```

- **`ci.yml`** — type check, lint, format check, build, then the full test suite inside a live Obsidian container. The `test` job is gated on `check` passing.
- **`docker.yml`** — triggers via `workflow_run` after CI passes on `main`. Always builds and pushes `latest` + `main`. If `package.json` version has no corresponding git tag yet, also builds versioned images (`1.1.1`, `1.1`), creates the git tag, and publishes a GitHub release with auto-generated notes.

### Layer caching is shared

Both workflows use `docker/build-push-action` with `cache-from: type=gha` and `cache-to: type=gha,mode=max`. They share the same default buildx cache scope, so layers written by `docker.yml` are available to `ci.yml`'s test job on the next run — and vice versa.

### Releasing a new version

Bump `version` in `package.json`, commit, and push to `main`. That's it — CI runs automatically, and once green the Docker workflow detects the new version and publishes the versioned image and GitHub release.

---

## Roadmap & planned additions

### Self-documenting REST API

A structured HTTP API for deterministic, non-agent use cases. Unlike the MCP interface — which is designed for LLM tool-calling — the REST API will expose the same operations as predictable, typed endpoints suitable for direct integration with automation platforms, scripts, and workflows that don't involve an AI model in the loop. The API will be self-documenting via OpenAPI.

### n8n custom node

A native [n8n](https://n8n.io) node built on top of the REST API, allowing self-hosted n8n instances to read and write Obsidian vaults as first-class workflow steps — no HTTP Request node configuration required.

### Bun migration (under consideration)

We're evaluating a rewrite of the MCP server runtime from Node.js to [Bun](https://bun.sh). Bun can compile TypeScript to a self-contained executable with no external runtime dependency, which would eliminate the Node.js install step from the Dockerfile entirely. This would meaningfully reduce the final image size and simplify the build process. The API surface and source code structure would remain unchanged — it's a runtime swap, not a rewrite.
