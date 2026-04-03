# obsidian-autom8

![Build](https://github.com/dylansumser/obsidian-autom8/actions/workflows/build.yml/badge.svg)
![Image](https://ghcr-badge.egpl.dev/dylansumser/obsidian-autom8/size)
![License](https://img.shields.io/github/license/dylansumser/obsidian-autom8)

`obsidian-autom8` makes it easy to give your agents remote access to your [Obsidian](https://obsidian.md) via the Model Context Protocol (MCP), built on top of the [linuxserver/docker-obsidian](https://github.com/linuxserver/docker-obsidian) image.

→ [Full MCP tools reference](docs/tools.md) · [Architecture, contributing & roadmap](CONTRIBUTING.md)

> **Security note:** similarly to the [linuxserver/docker-obsidian](https://github.com/linuxserver/docker-obsidian) base image, this container has no HTTPS support and should not be exposed to an unsecured network. For secure deployments, place it behind a reverse proxy (e.g. Caddy, Nginx Proxy Manager, Traefik) that handles TLS termination.

---

## Quickstart

### 1. Run the container

**Option A — Pull from GHCR (recommended):**

```bash
# podman run -d \
docker run -d \
  --name obsidian-autom8 \
  -p 3000:3000 \
  -p 3002:3002 \
  --shm-size="1gb" \
  -v obsidian-config:/config \
  -e CUSTOM_USER=admin \
  -e PASSWORD=changeme \
  -e OBSIDIAN_MCP_API_KEY=your-secret-key \
  ghcr.io/dylansumser/obsidian-autom8:latest
```

To pin to a specific release instead of `latest`, replace the tag with a version number (e.g. `ghcr.io/dylansumser/obsidian-autom8:1.0.0`).

**Option B — Build from source:**

```bash
git clone https://github.com/dylansumser/obsidian-autom8.git
cd obsidian-autom8
# podman build -t obsidian-autom8 .
docker build -t obsidian-autom8 .
# podman run -d \
docker run -d \
  --name obsidian-autom8 \
  -p 3000:3000 \
  -p 3002:3002 \
  --shm-size="1gb" \
  -v obsidian-config:/config \
  -e CUSTOM_USER=admin \
  -e PASSWORD=changeme \
  -e OBSIDIAN_MCP_API_KEY=your-secret-key \
  obsidian-autom8
```

### 2. Open Obsidian and enable the CLI

1. Open `http://localhost:3000` in your browser (log in with your `CUSTOM_USER` / `PASSWORD`)
2. Login with [Obsidian Sync](https://obsidian.md/sync) and create your synced vault under the `config` directory so your vault persists across container restarts, and wait for the sync to complete.
3. Go to **Settings → General** and enable **Command line interface**
4. Follow the prompt to register the CLI — this writes the `obsidian` binary to `/config/.local/bin/obsidian`

> **Direct file access:** If you want local agents or scripts on the host to read and write vault files directly alongside the MCP server, use a bind mount instead of a named volume (see [Volumes](#volumes) below). This is useful for raw file operations that complement the MCP tools.

### 3. Connect an AI agent

The MCP server speaks standard HTTP — any MCP-compatible agent can connect. Below are examples for common CLI tools.

**Claude Code:**

```bash
claude mcp add --transport http -s project obsidian-autom8 http://localhost:3002/mcp \
  --header "Authorization: Bearer your-secret-key"
```

**Gemini CLI** — add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "obsidian-autom8": {
      "httpUrl": "http://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer your-secret-key"
      }
    }
  }
}
```

**Codex CLI** — add to `~/.codex/config.toml`:

```toml
[[mcp_servers]]
name    = "obsidian-autom8"
url     = "http://localhost:3002/mcp"

[mcp_servers.headers]
Authorization = "Bearer your-secret-key"
```

---

## Why

The Obsidian CLI is excellent for local use by humans or closely supervised agents and [obsidian-headless](https://obsidian.md/help/headless) is excellent for remote backups of your vault via obsidian sync.

This project exists to give agents and automations remote, restrictable, and always available access to your vault beyond simple file based interfaces. By using obsidian's internal APIs from the CLI remotely, obsidian-autom8 lets your agents and automations:

* View and manage tags, bases, and properties
* Follow and manage your note graph
* Execute commands from your command palette (like [obsidian-linter](https://github.com/platers/obsidian-linter)).
* And more!

---

## How it works

The image layers two things on top of `lscr.io/linuxserver/obsidian:latest`:

1. **Node.js + MCP server** — compiled from this repo and registered as an [s6-overlay](https://github.com/just-containers/s6-overlay) service. It starts automatically alongside Obsidian and restarts on crash.

2. **Obsidian CLI** — the MCP server communicates with Obsidian by shelling out to the `obsidian` CLI binary that Obsidian registers at `/config/.local/bin/obsidian` when you enable it in Settings. The CLI connects to the running Obsidian app over a Unix socket at `/config/.XDG/.obsidian-cli.sock`.

This means **Obsidian must be running** (i.e. the container must be up and you must have completed the CLI setup) before the MCP tools will work.

### CLI setup persistence

The CLI registration is stored in `/config`, which is a named volume. This means you only need to enable it once — it persists across container restarts and image upgrades as long as the volume is not deleted.

If you recreate the volume or start fresh, repeat step 2 of the quickstart.

---

## Docker Compose

```yaml
services:
  obsidian-autom8:
    image: ghcr.io/dylansumser/obsidian-autom8:latest
    container_name: obsidian-autom8
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
      - CUSTOM_USER=admin
      - PASSWORD=changeme
      - OBSIDIAN_MCP_API_KEY=your-secret-key
      - OBSIDIAN_VAULT=My Vault       # optional: default vault name
    volumes:
      - obsidian-config:/config
    ports:
      - 3000:3000   # Selkies web UI
      - 3002:3002   # MCP API
    shm_size: 1gb
    restart: unless-stopped

volumes:
  obsidian-config:
```

## Podman Quadlet

Create `/etc/containers/systemd/obsidian-autom8.container`:

```ini
[Unit]
Description=Obsidian Autom8 MCP Server
After=network-online.target

[Container]
Image=ghcr.io/dylansumser/obsidian-autom8:latest
ContainerName=obsidian-autom8

PublishPort=3000:3000
PublishPort=3002:3002

Volume=obsidian-config:/config

Environment=PUID=1000
Environment=PGID=1000
Environment=TZ=America/New_York
Environment=CUSTOM_USER=admin
Environment=PASSWORD=changeme
Environment=OBSIDIAN_MCP_API_KEY=your-secret-key
Environment=OBSIDIAN_VAULT=My Vault

ShmSize=1gb

[Service]
Restart=always

[Install]
WantedBy=default.target
```

Then enable it:

```bash
systemctl --user daemon-reload
systemctl --user enable --now obsidian-autom8
```

---

## Configuration

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CUSTOM_USER` | Recommended | `abc` | Username for the Selkies web UI |
| `PASSWORD` | Recommended | — | Password for the Selkies web UI |
| `OBSIDIAN_MCP_API_KEY` | Recommended | — | Bearer token required to call the MCP API. If unset, the API is unauthenticated. |
| `OBSIDIAN_VAULT` | No | — | Default vault name passed to every CLI call. If unset, Obsidian uses the currently active vault. |
| `MCP_PORT` | No | `3002` | Port the MCP server listens on. |
| `PUID` / `PGID` | No | `1000` | User/group ID to run as. Inherited from the linuxserver base image. |
| `TZ` | No | `UTC` | Timezone. |

### Ports

| Port | Description |
|---|---|
| `3000` | Selkies remote desktop — access Obsidian in your browser |
| `3001` | Selkies SSL (nginx) — used internally |
| `3002` | MCP API — connects to Claude Code or other MCP clients |

### Volumes

| Path | Description |
|---|---|
| `/config` | Obsidian config, vault data, and CLI registration. Persist this volume to survive container restarts. |

**Named volume (default)** — Docker manages the storage, simplest setup:

```
-v obsidian-config:/config
```

**Bind mount (optional)** — mounts a host directory directly, so local agents and scripts can access vault files alongside the MCP server. Your vault should live inside this directory (e.g. `/path/to/your/config/my-vault`):

```
-v /path/to/your/config:/config
```

> **MCP tool scope:** The MCP server is optimized for note-level operations — reading, writing, searching, and modifying existing content. For larger filesystem operations like reorganizing or moving entire directory structures, direct file access via a bind mount is more reliable.
