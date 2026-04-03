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

  private constructor(defaultVault?: string) {
    this.defaultVault = defaultVault;
  }

  static getInstance(defaultVault?: string): ObsidianExecutor {
    if (!ObsidianExecutor.instance) {
      ObsidianExecutor.instance = new ObsidianExecutor(defaultVault);
    }
    return ObsidianExecutor.instance;
  }

  run(command: string, args: CliArgs = {}, vault?: string): Promise<string> {
    const next = this.tail.then(() => this._exec(command, args, vault));
    // errors must not break the chain, but are still propagated to the caller
    this.tail = next.catch(() => {});
    return next;
  }

  async runJson(command: string, args: CliArgs = {}, vault?: string): Promise<unknown> {
    const enriched = JSON_FORMAT_SUPPORTED.has(command) ? { ...args, format: "json" } : args;
    const out = await this.run(command, enriched, vault);
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

  private async _exec(command: string, args: CliArgs, vault?: string): Promise<string> {
    const v = vault ?? this.defaultVault;
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
