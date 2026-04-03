import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";
import { requireOneOf } from "./utils.js";

export const listHistoryFilesSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listNoteVersionsSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const readNoteVersionSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  version: z.number().describe("Version number (1 = most recent)"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const restoreNoteVersionSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  version: z.number().describe("Version number to restore"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const diffNoteSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  from: z.number().optional().describe("Version number to diff from"),
  to: z.number().optional().describe("Version number to diff to"),
  filter: z.enum(["local", "sync"]).optional().describe("Filter by version source"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listHistoryFiles(
  executor: ObsidianExecutor,
  input: z.infer<typeof listHistoryFilesSchema>,
): Promise<string> {
  return executor.run("history:list", {}, input.vault);
}

export async function listNoteVersions(
  executor: ObsidianExecutor,
  input: z.infer<typeof listNoteVersionsSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run("history", { file: input.file, path: input.path }, input.vault);
}

export async function readNoteVersion(
  executor: ObsidianExecutor,
  input: z.infer<typeof readNoteVersionSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run(
    "history:read",
    { file: input.file, path: input.path, version: input.version },
    input.vault,
  );
}

export async function restoreNoteVersion(
  executor: ObsidianExecutor,
  input: z.infer<typeof restoreNoteVersionSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "history:restore",
    { file: input.file, path: input.path, version: input.version },
    input.vault,
  );
}

export async function diffNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof diffNoteSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run(
    "diff",
    {
      file: input.file,
      path: input.path,
      from: input.from,
      to: input.to,
      filter: input.filter,
    },
    input.vault,
  );
}
