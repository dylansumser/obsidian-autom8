import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const listCommandsSchema = z.object({
  filter: z.string().optional().describe("Filter by ID prefix e.g. 'obsidian-linter'"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const executeCommandSchema = z.object({
  id: z.string().describe("Command ID (from list_commands)"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listCommands(
  executor: ObsidianExecutor,
  input: z.infer<typeof listCommandsSchema>,
): Promise<string> {
  return executor.run("commands", { filter: input.filter }, input.vault);
}

export async function executeCommand(
  executor: ObsidianExecutor,
  input: z.infer<typeof executeCommandSchema>,
): Promise<string> {
  return executor.run("command", { id: input.id }, input.vault);
}
