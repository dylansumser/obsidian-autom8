import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const TEST_VAULT = process.env.OBSIDIAN_VAULT ?? "test-vault";

async function sweepTestNotes(): Promise<void> {
  try {
    const { stdout } = await execFileAsync("obsidian", [`vault=${TEST_VAULT}`, "files", "ext=md"], {
      timeout: 15_000,
      env: process.env,
    });
    const files = stdout
      .trim()
      .split("\n")
      .filter(
        (f) =>
          f.includes("test-mcp-") ||
          f.includes("search-fixture") ||
          f.includes("tasks-fixture") ||
          f.includes("props-"),
      );

    for (const file of files) {
      try {
        await execFileAsync(
          "obsidian",
          [`vault=${TEST_VAULT}`, "delete", `path=${file}`, "permanent"],
          { timeout: 10_000, env: process.env },
        );
      } catch {
        // best-effort
      }
    }
  } catch {
    // vault may be empty — ignore
  }
}

export async function setup(): Promise<void> {
  await sweepTestNotes();
}

export async function teardown(): Promise<void> {
  await sweepTestNotes();
}
