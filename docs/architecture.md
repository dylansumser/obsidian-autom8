# Architecture

obsidian-autom8 layers two components on top of [`lscr.io/linuxserver/obsidian`](https://github.com/linuxserver/docker-obsidian): an MCP server and the Obsidian CLI. The MCP server is written in TypeScript, compiled to a single CJS bundle via esbuild, and registered as an s6-overlay service so it starts and restarts automatically alongside Obsidian.

## Container architecture

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

## Source code layout

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

## Request flow

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
