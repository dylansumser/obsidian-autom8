import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";
import { requireOneOf } from "./utils.js";

export const getVaultInfoSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const listVaultsSchema = z.object({});

export const listFoldersSchema = z.object({
  folder: z.string().optional().describe("Parent folder path to list within"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const getFileInfoSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const getFolderInfoSchema = z.object({
  path: z.string().describe("Folder path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function getVaultInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getVaultInfoSchema>,
): Promise<string> {
  return executor.run("vault", {}, input.vault);
}

export async function listVaults(
  executor: ObsidianExecutor,
  _input: z.infer<typeof listVaultsSchema>,
): Promise<string> {
  return executor.run("vaults", {});
}

export async function listFolders(
  executor: ObsidianExecutor,
  input: z.infer<typeof listFoldersSchema>,
): Promise<string> {
  return executor.run("folders", { folder: input.folder }, input.vault);
}

export async function getFileInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getFileInfoSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run("file", { file: input.file, path: input.path }, input.vault);
}

export async function getFolderInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getFolderInfoSchema>,
): Promise<string> {
  return executor.run("folder", { path: input.path }, input.vault);
}
