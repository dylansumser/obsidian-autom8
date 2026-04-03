import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const tagItemSchema = z.object({
  tag: z.string(),
  count: z.string().optional(),
});
export type TagItem = z.infer<typeof tagItemSchema>;

export const listTagsSchema = z.object({
  file: z.string().optional().describe("Limit to this note (fuzzy match)"),
  path: z.string().optional().describe("Limit to this exact file path"),
  counts: z.boolean().optional().describe("Include usage counts"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const getTagInfoSchema = z.object({
  name: z.string().describe("Tag name (with or without leading #)"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listAliasesSchema = z.object({
  file: z.string().optional().describe("Limit to this note (fuzzy match)"),
  path: z.string().optional().describe("Limit to this exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listTags(
  executor: ObsidianExecutor,
  input: z.infer<typeof listTagsSchema>,
): Promise<TagItem[]> {
  const raw = await executor.runJson(
    "tags",
    { file: input.file, path: input.path, counts: input.counts },
    input.vault,
  );
  return z.array(tagItemSchema).parse(raw);
}

export async function getTagInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getTagInfoSchema>,
): Promise<string> {
  return executor.run("tag", { name: input.name, verbose: true }, input.vault);
}

export async function listAliases(
  executor: ObsidianExecutor,
  input: z.infer<typeof listAliasesSchema>,
): Promise<string> {
  // aliases does not support format=json — returns tsv
  return executor.run(
    "aliases",
    { file: input.file, path: input.path, verbose: true },
    input.vault,
  );
}
