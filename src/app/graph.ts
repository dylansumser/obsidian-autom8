import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";
import { requireOneOf } from "./utils.js";

export const backlinkItemSchema = z.object({
  file: z.string(),
  count: z.string().optional(),
});
export type BacklinkItem = z.infer<typeof backlinkItemSchema>;

export const unresolvedLinkSchema = z.object({
  link: z.string(),
  count: z.string().optional(),
});
export type UnresolvedLink = z.infer<typeof unresolvedLinkSchema>;

export const getNoteBacklinksSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  counts: z.boolean().optional().describe("Include link counts"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const getNoteLinksSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listUnresolvedLinksSchema = z.object({
  counts: z.boolean().optional().describe("Include occurrence counts per unresolved link"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listOrphanNotesSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listDeadendNotesSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function getNoteBacklinks(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteBacklinksSchema>,
): Promise<BacklinkItem[]> {
  requireOneOf({ file: input.file, path: input.path });
  const raw = await executor.runJson(
    "backlinks",
    { file: input.file, path: input.path, counts: input.counts },
    input.vault,
  );
  return z.array(backlinkItemSchema).parse(raw);
}

export async function getNoteLinks(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteLinksSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run("links", { file: input.file, path: input.path }, input.vault);
}

export async function listUnresolvedLinks(
  executor: ObsidianExecutor,
  input: z.infer<typeof listUnresolvedLinksSchema>,
): Promise<UnresolvedLink[]> {
  const raw = await executor.runJson("unresolved", { counts: input.counts }, input.vault);
  if (!Array.isArray(raw)) return [];
  return z.array(unresolvedLinkSchema).parse(raw);
}

export async function listOrphanNotes(
  executor: ObsidianExecutor,
  input: z.infer<typeof listOrphanNotesSchema>,
): Promise<string> {
  return executor.run("orphans", {}, input.vault);
}

export async function listDeadendNotes(
  executor: ObsidianExecutor,
  input: z.infer<typeof listDeadendNotesSchema>,
): Promise<string> {
  return executor.run("deadends", {}, input.vault);
}
