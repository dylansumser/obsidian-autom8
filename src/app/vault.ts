import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const getVaultInfoSchema = z.object({});

export const listVaultsSchema = z.object({});

export const listFoldersSchema = z.object({
  folder: z.string().optional().describe("Parent folder path to list within"),
});

export const getFileInfoSchema = z.object({
  path: z.string().describe("Exact file path"),
});

export const getFolderInfoSchema = z.object({
  path: z.string().describe("Folder path"),
});

export async function getVaultInfo(
  executor: ObsidianExecutor,
  _input: z.infer<typeof getVaultInfoSchema>,
): Promise<string> {
  return executor.run("vault", {});
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
  return executor.run("folders", { folder: input.folder });
}

export async function getFileInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getFileInfoSchema>,
): Promise<string> {
  return executor.run("file", { path: input.path });
}

export async function getFolderInfo(
  executor: ObsidianExecutor,
  input: z.infer<typeof getFolderInfoSchema>,
): Promise<string> {
  return executor.run("folder", { path: input.path });
}
