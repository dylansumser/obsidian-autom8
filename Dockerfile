# Stage 1: Build TypeScript with esbuild
FROM node:24-slim AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Extend the linuxserver Obsidian image
FROM lscr.io/linuxserver/obsidian:latest

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# Copy built MCP server bundle (No node_modules needed!)
COPY --from=builder /build/dist/obsidian-autom8.cjs /app/obsidian-autom8.cjs

# Wire MCP server as an s6 service (auto-restarts on crash)
RUN mkdir -p /etc/s6-overlay/s6-rc.d/svc-obsidian-autom8/dependencies.d \
  && mkdir -p /etc/s6-overlay/s6-rc.d/user/contents.d \
  && echo "longrun" > /etc/s6-overlay/s6-rc.d/svc-obsidian-autom8/type \
  && touch /etc/s6-overlay/s6-rc.d/user/contents.d/svc-obsidian-autom8 \
  && printf '#!/usr/bin/with-contenv sh\nexec s6-setuidgid abc node /app/obsidian-autom8.cjs --port "${MCP_PORT:-3002}"\n' \
     > /etc/s6-overlay/s6-rc.d/svc-obsidian-autom8/run \
  && chmod +x /etc/s6-overlay/s6-rc.d/svc-obsidian-autom8/run

# Configuration — read directly from process.env by the MCP server
ENV MCP_PORT=3002
ENV OBSIDIAN_VAULT=""
ENV OBSIDIAN_BIN="/config/.local/bin/obsidian"
ENV XDG_RUNTIME_DIR="/config/.XDG"

# MCP server port (3000=Selkies GUI, 3001=nginx SSL, 3002=MCP API)
EXPOSE 3002
