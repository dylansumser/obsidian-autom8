import { z } from "zod";
import { parse as parseYaml } from "yaml";
import type { ObsidianExecutor } from "./executor.js";

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

export const listBasesSchema = z.object({});

export const listBaseViewsSchema = z.object({
  path: z.string().describe("Exact base file path e.g. My Base.base"),
});

export const listBasePropertiesSchema = z.object({
  path: z.string().describe("Exact base file path e.g. My Base.base"),
});

export const queryBaseSchema = z.object({
  path: z.string().describe("Exact base file path e.g. My Base.base"),
  view: z.string().optional().describe("View name to query (defaults to first view)"),
});

export const createBaseItemSchema = z.object({
  path: z.string().describe("Exact base file path e.g. My Base.base"),
  name: z.string().optional().describe("Name for the new note"),
  content: z.string().optional().describe("Initial content for the new note"),
  view: z.string().optional().describe("View name to create the item in"),
});

export async function listBases(
  executor: ObsidianExecutor,
  _input: z.infer<typeof listBasesSchema>,
): Promise<string> {
  return executor.run("bases", {});
}

function normalizeBasePath(path: string): string {
  return path.endsWith(".base") ? path : `${path}.base`;
}

export async function listBaseViews(
  executor: ObsidianExecutor,
  input: z.infer<typeof listBaseViewsSchema>,
): Promise<{ name: string; type: string; columns: string[] }[]> {
  const raw = await executor.run("read", { path: normalizeBasePath(input.path) });
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
  const raw = await executor.run("read", { path: normalizeBasePath(input.path) });
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
  const path = normalizeBasePath(input.path);
  const raw = await executor.runJson("base:query", { path, view: input.view });
  return z.array(baseRowSchema).parse(raw);
}

export async function createBaseItem(
  executor: ObsidianExecutor,
  input: z.infer<typeof createBaseItemSchema>,
): Promise<void> {
  const path = normalizeBasePath(input.path);
  await executor.run("base:create", {
    path,
    name: input.name,
    content: input.content,
    view: input.view,
  });
}
