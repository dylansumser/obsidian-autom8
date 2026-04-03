import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const readDailyNoteSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const appendToDailyNoteSchema = z.object({
  content: z.string().describe("Content to append"),
  inline: z.boolean().optional().describe("Append without a leading newline"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const prependToDailyNoteSchema = z.object({
  content: z.string().describe("Content to prepend"),
  inline: z.boolean().optional().describe("Prepend without a trailing newline"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const getDailyNotePathSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function readDailyNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof readDailyNoteSchema>,
): Promise<string> {
  return executor.run("daily:read", {}, input.vault);
}

export async function appendToDailyNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof appendToDailyNoteSchema>,
): Promise<void> {
  await executor.run("daily:append", { content: input.content, inline: input.inline }, input.vault);
}

export async function prependToDailyNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof prependToDailyNoteSchema>,
): Promise<void> {
  await executor.run(
    "daily:prepend",
    { content: input.content, inline: input.inline },
    input.vault,
  );
}

export async function getDailyNotePath(
  executor: ObsidianExecutor,
  input: z.infer<typeof getDailyNotePathSchema>,
): Promise<string> {
  return executor.run("daily:path", {}, input.vault);
}
