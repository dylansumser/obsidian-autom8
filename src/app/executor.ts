import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const OBSIDIAN_BIN = process.env.OBSIDIAN_BIN ?? "obsidian";

// Commands that accept format=json. All others return plain text.
const JSON_FORMAT_SUPPORTED = new Set([
  "backlinks",
  "base:query",
  "bookmarks",
  "hotkeys",
  "outline",
  "plugins",
  "plugins:enabled",
  "properties",
  "search",
  "search:context",
  "tags",
  "tasks",
  "unresolved",
]);

export type CliArgs = Record<string, string | number | boolean | undefined | null>;

class ObsidianExecutor {
  private static instance: ObsidianExecutor;
  private tail: Promise<unknown> = Promise.resolve();
  private readonly defaultVault: string | undefined;
  private vaultPath: string | undefined;

  private constructor(defaultVault?: string) {
    this.defaultVault = defaultVault;
  }

  static getInstance(defaultVault?: string): ObsidianExecutor {
    if (!ObsidianExecutor.instance) {
      ObsidianExecutor.instance = new ObsidianExecutor(defaultVault);
    }
    return ObsidianExecutor.instance;
  }

  run(command: string, args: CliArgs = {}): Promise<string> {
    const next = this.tail.then(() => this._exec(command, args));
    // errors must not break the chain, but are still propagated to the caller
    this.tail = next.catch(() => {});
    return next;
  }

  /** Enqueue an arbitrary async operation into the serial queue. */
  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.tail.then(() => fn());
    this.tail = next.catch(() => {});
    return next;
  }

  async runJson(command: string, args: CliArgs = {}): Promise<unknown> {
    const enriched = JSON_FORMAT_SUPPORTED.has(command) ? { ...args, format: "json" } : args;
    const out = await this.run(command, enriched);
    const lowerOut = out.toLowerCase();
    if (
      out === "" ||
      (lowerOut.startsWith("no ") && lowerOut.includes("found")) ||
      lowerOut.includes("no matches found")
    ) {
      return [];
    }
    try {
      return JSON.parse(out);
    } catch {
      if (JSON_FORMAT_SUPPORTED.has(command)) {
        throw new Error(`Command '${command}' expected JSON but got: ${out}`);
      }
      return out;
    }
  }

  /** Lazily resolves and caches the vault's filesystem path.
   * Checks OBSIDIAN_VAULT_PATH env var first (useful when the CLI runs inside
   * a container but the MCP server accesses the filesystem on the host). */
  async resolveVaultPath(): Promise<string> {
    if (this.vaultPath) return this.vaultPath;
    const envPath = process.env.OBSIDIAN_VAULT_PATH;
    if (envPath) {
      this.vaultPath = envPath;
      return envPath;
    }
    const path = await this._exec("vault", { info: "path" });
    this.vaultPath = path;
    return path;
  }

  private async _exec(command: string, args: CliArgs): Promise<string> {
    const v = this.defaultVault;
    const cliArgs: string[] = [];

    if (v) cliArgs.push(`vault=${v}`);
    cliArgs.push(command);

    for (const [key, value] of Object.entries(args)) {
      if (value === undefined || value === null || value === false) continue;
      if (value === true) {
        cliArgs.push(key);
      } else {
        cliArgs.push(`${key}=${String(value)}`);
      }
    }

    const { stdout } = await execFileAsync(OBSIDIAN_BIN, cliArgs, {
      timeout: 30_000,
      env: process.env,
    });
    const out = stdout.trim();
    const lowerOut = out.toLowerCase();
    if (lowerOut.startsWith("error:") || lowerOut.includes("vault not found")) {
      throw new Error(out);
    }
    return out;
  }
}

export { ObsidianExecutor };
