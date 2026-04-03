import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const searchVaultSchema = z.object({
  query: z.string().describe("Search query"),
  folder: z.string().optional().describe("Limit search to this folder path"),
  limit: z.number().optional().describe("Maximum number of results"),
  caseSensitive: z.boolean().optional().describe("Case-sensitive search"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const searchVaultContextSchema = z.object({
  query: z.string().describe("Search query"),
  folder: z.string().optional().describe("Limit search to this folder path"),
  limit: z.number().optional().describe("Maximum number of results"),
  caseSensitive: z.boolean().optional().describe("Case-sensitive search"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

/** File paths matching the search query. */
export const searchResultSchema = z.string().describe("Vault-relative file path");
export type SearchResult = z.infer<typeof searchResultSchema>;

export const searchContextMatchSchema = z.object({
  line: z.number(),
  text: z.string(),
});
export type SearchContextMatch = z.infer<typeof searchContextMatchSchema>;

export const searchContextResultSchema = z.object({
  file: z.string(),
  matches: z.array(searchContextMatchSchema),
});
export type SearchContextResult = z.infer<typeof searchContextResultSchema>;

export const listFilesSchema = z.object({
  folder: z.string().optional().describe("Folder path to list files in"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function searchVault(
  executor: ObsidianExecutor,
  input: z.infer<typeof searchVaultSchema>,
): Promise<SearchResult[]> {
  const raw = await executor.runJson(
    "search",
    {
      query: input.query,
      path: input.folder,
      limit: input.limit,
      case: input.caseSensitive,
    },
    input.vault,
  );
  return z.array(searchResultSchema).parse(Array.isArray(raw) ? raw : []);
}

export async function searchVaultContext(
  executor: ObsidianExecutor,
  input: z.infer<typeof searchVaultContextSchema>,
): Promise<SearchContextResult[]> {
  const raw = await executor.runJson(
    "search:context",
    {
      query: input.query,
      path: input.folder,
      limit: input.limit,
      case: input.caseSensitive,
    },
    input.vault,
  );
  return z.array(searchContextResultSchema).parse(raw);
}

export async function listFiles(
  executor: ObsidianExecutor,
  input: z.infer<typeof listFilesSchema>,
): Promise<string> {
  return executor.run("files", { folder: input.folder }, input.vault);
}
