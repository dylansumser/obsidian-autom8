import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

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
  path: z.string().describe("Exact file path"),
  counts: z.boolean().optional().describe("Include link counts"),
});

export const getNoteLinksSchema = z.object({
  path: z.string().describe("Exact file path"),
});

export const listUnresolvedLinksSchema = z.object({
  counts: z.boolean().optional().describe("Include occurrence counts per unresolved link"),
});

export const listOrphanNotesSchema = z.object({});

export const listDeadendNotesSchema = z.object({});

export async function getNoteBacklinks(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteBacklinksSchema>,
): Promise<BacklinkItem[]> {
  const raw = await executor.runJson("backlinks", { path: input.path, counts: input.counts });
  return z.array(backlinkItemSchema).parse(raw);
}

export async function getNoteLinks(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteLinksSchema>,
): Promise<string> {
  return executor.run("links", { path: input.path });
}

export async function listUnresolvedLinks(
  executor: ObsidianExecutor,
  input: z.infer<typeof listUnresolvedLinksSchema>,
): Promise<UnresolvedLink[]> {
  const raw = await executor.runJson("unresolved", { counts: input.counts });
  if (!Array.isArray(raw)) return [];
  return z.array(unresolvedLinkSchema).parse(raw);
}

export async function listOrphanNotes(
  executor: ObsidianExecutor,
  _input: z.infer<typeof listOrphanNotesSchema>,
): Promise<string> {
  return executor.run("orphans", {});
}

export async function listDeadendNotes(
  executor: ObsidianExecutor,
  _input: z.infer<typeof listDeadendNotesSchema>,
): Promise<string> {
  return executor.run("deadends", {});
}
