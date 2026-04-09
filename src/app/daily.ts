import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const readDailyNoteSchema = z.object({});

export const appendToDailyNoteSchema = z.object({
  content: z.string().describe("Content to append"),
  inline: z.boolean().optional().describe("Append without a leading newline"),
});

export const prependToDailyNoteSchema = z.object({
  content: z.string().describe("Content to prepend"),
  inline: z.boolean().optional().describe("Prepend without a trailing newline"),
});

export const getDailyNotePathSchema = z.object({});

export async function readDailyNote(
  executor: ObsidianExecutor,
  _input: z.infer<typeof readDailyNoteSchema>,
): Promise<string> {
  return executor.run("daily:read", {});
}

export async function appendToDailyNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof appendToDailyNoteSchema>,
): Promise<void> {
  await executor.run("daily:append", { content: input.content, inline: input.inline });
}

export async function prependToDailyNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof prependToDailyNoteSchema>,
): Promise<void> {
  await executor.run("daily:prepend", { content: input.content, inline: input.inline });
}

export async function getDailyNotePath(
  executor: ObsidianExecutor,
  _input: z.infer<typeof getDailyNotePathSchema>,
): Promise<string> {
  return executor.run("daily:path", {});
}
