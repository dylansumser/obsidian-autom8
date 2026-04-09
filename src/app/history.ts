import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const listHistoryFilesSchema = z.object({});

export const listNoteVersionsSchema = z.object({
  path: z.string().describe("Exact file path"),
});

export const readNoteVersionSchema = z.object({
  path: z.string().describe("Exact file path"),
  version: z.number().describe("Version number (1 = most recent)"),
});

export const restoreNoteVersionSchema = z.object({
  path: z.string().describe("Exact file path"),
  version: z.number().describe("Version number to restore"),
});

export const diffNoteSchema = z.object({
  path: z.string().describe("Exact file path"),
  from: z.number().optional().describe("Version number to diff from"),
  to: z.number().optional().describe("Version number to diff to"),
  filter: z.enum(["local", "sync"]).optional().describe("Filter by version source"),
});

export async function listHistoryFiles(
  executor: ObsidianExecutor,
  _input: z.infer<typeof listHistoryFilesSchema>,
): Promise<string> {
  return executor.run("history:list", {});
}

export async function listNoteVersions(
  executor: ObsidianExecutor,
  input: z.infer<typeof listNoteVersionsSchema>,
): Promise<string> {
  return executor.run("history", { path: input.path });
}

export async function readNoteVersion(
  executor: ObsidianExecutor,
  input: z.infer<typeof readNoteVersionSchema>,
): Promise<string> {
  return executor.run("history:read", { path: input.path, version: input.version });
}

export async function restoreNoteVersion(
  executor: ObsidianExecutor,
  input: z.infer<typeof restoreNoteVersionSchema>,
): Promise<void> {
  await executor.run("history:restore", { path: input.path, version: input.version });
}

export async function diffNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof diffNoteSchema>,
): Promise<string> {
  return executor.run("diff", {
    path: input.path,
    from: input.from,
    to: input.to,
    filter: input.filter,
  });
}
