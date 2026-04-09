import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const tagItemSchema = z.object({
  tag: z.string(),
  count: z.string().optional(),
});
export type TagItem = z.infer<typeof tagItemSchema>;

export const listTagsSchema = z.object({
  path: z.string().optional().describe("Limit to this exact file path"),
  counts: z.boolean().optional().describe("Include usage counts"),
});

export const getTagInfoSchema = z.object({
  name: z.string().describe("Tag name (with or without leading #)"),
});

export const listAliasesSchema = z.object({
  path: z.string().optional().describe("Limit to this exact file path"),
});

export async function listTags(
  executor: ObsidianExecutor,
  input: z.infer<typeof listTagsSchema>,
): Promise<TagItem[]> {
  const raw = await executor.runJson("tags", { path: input.path, counts: input.counts });
  return z.array(tagItemSchema).parse(raw);
}

export async function getTagInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getTagInfoSchema>,
): Promise<string> {
  return executor.run("tag", { name: input.name, verbose: true });
}

export async function listAliases(
  executor: ObsidianExecutor,
  input: z.infer<typeof listAliasesSchema>,
): Promise<string> {
  // aliases does not support format=json — returns tsv
  return executor.run("aliases", { path: input.path, verbose: true });
}
