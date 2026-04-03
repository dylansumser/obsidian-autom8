import { z } from "zod";
import { parse as parseYaml } from "yaml";
import type { ObsidianExecutor } from "./executor.js";
import { requireOneOf } from "./utils.js";

interface BaseView {
  name?: string;
  type?: string;
  filters?: unknown;
  order?: string[];
  groupBy?: unknown;
  summaries?: unknown;
}

interface BaseSchema {
  views?: BaseView[];
  properties?: Record<string, { displayName?: string }>;
  formulas?: Record<string, string>;
  filters?: unknown;
  summaries?: unknown;
}

export const baseRowSchema = z.record(z.string(), z.unknown());
export type BaseRow = z.infer<typeof baseRowSchema>;

export const listBasesSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listBaseViewsSchema = z.object({
  file: z.string().optional().describe("Base file name (fuzzy match)"),
  path: z.string().optional().describe("Exact base file path e.g. My Base.base"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listBasePropertiesSchema = z.object({
  file: z.string().optional().describe("Base file name (fuzzy match)"),
  path: z.string().optional().describe("Exact base file path e.g. My Base.base"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const queryBaseSchema = z.object({
  file: z
    .string()
    .optional()
    .describe("Base file name (fuzzy match) — .base extension added automatically if omitted"),
  path: z.string().optional().describe("Exact base file path e.g. My Base.base"),
  view: z.string().optional().describe("View name to query (defaults to first view)"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const createBaseItemSchema = z.object({
  file: z
    .string()
    .optional()
    .describe("Base file name (fuzzy match) — .base extension added automatically if omitted"),
  path: z.string().optional().describe("Exact base file path e.g. My Base.base"),
  name: z.string().optional().describe("Name for the new note"),
  content: z.string().optional().describe("Initial content for the new note"),
  view: z.string().optional().describe("View name to create the item in"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listBases(
  executor: ObsidianExecutor,
  input: z.infer<typeof listBasesSchema>,
): Promise<string> {
  return executor.run("bases", {}, input.vault);
}

function resolveBasePath(file?: string, path?: string): { file?: string; path?: string } {
  if (path) return { path };
  if (file) return { path: file.endsWith(".base") ? file : `${file}.base` };
  return {};
}

export async function listBaseViews(
  executor: ObsidianExecutor,
  input: z.infer<typeof listBaseViewsSchema>,
): Promise<{ name: string; type: string; columns: string[] }[]> {
  requireOneOf({ file: input.file, path: input.path });
  const raw = await executor.run("read", resolveBasePath(input.file, input.path), input.vault);
  const schema = parseYaml(raw) as BaseSchema;
  return (schema.views ?? []).map((v) => ({
    name: v.name ?? "(unnamed)",
    type: v.type ?? "table",
    columns: v.order ?? [],
  }));
}

export async function listBaseProperties(
  executor: ObsidianExecutor,
  input: z.infer<typeof listBasePropertiesSchema>,
): Promise<{
  properties: { key: string; displayName: string }[];
  formulas: { key: string; expression: string }[];
}> {
  requireOneOf({ file: input.file, path: input.path });
  const raw = await executor.run("read", resolveBasePath(input.file, input.path), input.vault);
  const schema = parseYaml(raw) as BaseSchema;
  const properties = Object.entries(schema.properties ?? {}).map(([key, cfg]) => ({
    key,
    displayName: cfg.displayName ?? key,
  }));
  const formulas = Object.entries(schema.formulas ?? {}).map(([key, expr]) => ({
    key,
    expression: expr,
  }));
  return { properties, formulas };
}

export async function queryBase(
  executor: ObsidianExecutor,
  input: z.infer<typeof queryBaseSchema>,
): Promise<BaseRow[]> {
  requireOneOf({ file: input.file, path: input.path });
  const { file, path } = resolveBasePath(input.file, input.path);
  const raw = await executor.runJson("base:query", { file, path, view: input.view }, input.vault);
  return z.array(baseRowSchema).parse(raw);
}

export async function createBaseItem(
  executor: ObsidianExecutor,
  input: z.infer<typeof createBaseItemSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  const { file, path } = resolveBasePath(input.file, input.path);
  await executor.run(
    "base:create",
    { file, path, name: input.name, content: input.content, view: input.view },
    input.vault,
  );
}
