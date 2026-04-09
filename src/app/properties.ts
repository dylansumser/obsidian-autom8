import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const propertyItemSchema = z.object({
  name: z.string(),
  type: z.string(),
  count: z.number(),
});
export type PropertyItem = z.infer<typeof propertyItemSchema>;

/** Vault-wide property index — one entry per unique property across all notes. */
export type VaultPropertyList = PropertyItem[];

/** Per-file frontmatter — property names mapped to their raw values. */
export const filePropertiesSchema = z.record(z.string(), z.unknown());
export type FileProperties = z.infer<typeof filePropertiesSchema>;

export const listPropertiesSchema = z.object({
  path: z.string().optional().describe("Limit to this exact file path"),
  counts: z.boolean().optional().describe("Include occurrence counts per property"),
});

export const getPropertySchema = z.object({
  name: z.string().describe("Property name"),
  path: z.string().describe("Exact file path"),
});

export const setPropertySchema = z.object({
  name: z.string().describe("Property name"),
  value: z.string().describe("Property value"),
  type: z
    .enum(["text", "list", "number", "checkbox", "date", "datetime"])
    .optional()
    .describe("Property type (defaults to text)"),
  path: z.string().describe("Exact file path"),
});

export const removePropertySchema = z.object({
  name: z.string().describe("Property name to remove"),
  path: z.string().describe("Exact file path"),
});

export async function listProperties(
  executor: ObsidianExecutor,
  input: z.infer<typeof listPropertiesSchema>,
): Promise<VaultPropertyList | FileProperties> {
  const raw = await executor.runJson("properties", { path: input.path, counts: input.counts });
  if (Array.isArray(raw)) {
    return z.array(propertyItemSchema).parse(raw);
  }
  return filePropertiesSchema.parse(raw);
}

export async function getProperty(
  executor: ObsidianExecutor,
  input: z.infer<typeof getPropertySchema>,
): Promise<string> {
  return executor.run("property:read", { name: input.name, path: input.path });
}

export async function setProperty(
  executor: ObsidianExecutor,
  input: z.infer<typeof setPropertySchema>,
): Promise<void> {
  await executor.run("property:set", {
    name: input.name,
    value: input.value,
    type: input.type,
    path: input.path,
  });
}

export async function removeProperty(
  executor: ObsidianExecutor,
  input: z.infer<typeof removePropertySchema>,
): Promise<void> {
  await executor.run("property:remove", { name: input.name, path: input.path });
}
