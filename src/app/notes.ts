import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";
import { buildFrontmatter } from "./frontmatter.js";
import { requireOneOf } from "./utils.js";

export const readNoteSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const createNoteSchema = z.object({
  name: z.string().optional().describe("Note filename (without .md)"),
  path: z.string().optional().describe("Exact path e.g. folder/note.md"),
  content: z.string().optional().describe("Note body (markdown)"),
  properties: z
    .record(z.unknown())
    .optional()
    .describe("Frontmatter properties — merged above content"),
  template: z.string().optional().describe("Template name to apply on creation"),
  overwrite: z.boolean().optional().describe("Overwrite if file already exists"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const appendToNoteSchema = z.object({
  content: z.string().describe("Content to append"),
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  inline: z.boolean().optional().describe("Append without a leading newline"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const prependToNoteSchema = z.object({
  content: z.string().describe("Content to prepend"),
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  inline: z.boolean().optional().describe("Prepend without a trailing newline"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const deleteNoteSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  permanent: z.boolean().optional().describe("Skip trash and delete permanently"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const moveNoteSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact source file path"),
  destination: z.string().describe("Destination path e.g. folder/note.md"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const renameNoteSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  name: z.string().describe("New note name (without .md extension)"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const getNoteOutlineSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const noteHeadingSchema = z.object({
  level: z.number(),
  heading: z.string(),
  line: z.number(),
});
export type NoteHeading = z.infer<typeof noteHeadingSchema>;

export const getNoteWordcountSchema = z.object({
  file: z.string().optional().describe("Note name (fuzzy match)"),
  path: z.string().optional().describe("Exact file path"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function readNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof readNoteSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run("read", { file: input.file, path: input.path }, input.vault);
}

export async function createNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof createNoteSchema>,
): Promise<void> {
  let fullContent = input.content ?? "";
  if (input.properties && Object.keys(input.properties).length > 0) {
    fullContent = `${buildFrontmatter(input.properties as Record<string, unknown>)}\n\n${fullContent}`;
  }
  await executor.run(
    "create",
    {
      name: input.name,
      path: input.path,
      content: fullContent || undefined,
      template: input.template,
      overwrite: input.overwrite,
    },
    input.vault,
  );
}

export async function appendToNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof appendToNoteSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "append",
    {
      content: input.content,
      file: input.file,
      path: input.path,
      inline: input.inline,
    },
    input.vault,
  );
}

export async function prependToNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof prependToNoteSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "prepend",
    {
      content: input.content,
      file: input.file,
      path: input.path,
      inline: input.inline,
    },
    input.vault,
  );
}

export async function deleteNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof deleteNoteSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "delete",
    { file: input.file, path: input.path, permanent: input.permanent },
    input.vault,
  );
}

export async function moveNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof moveNoteSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "move",
    { file: input.file, path: input.path, to: input.destination },
    input.vault,
  );
}

export async function renameNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof renameNoteSchema>,
): Promise<void> {
  requireOneOf({ file: input.file, path: input.path });
  await executor.run(
    "rename",
    { file: input.file, path: input.path, name: input.name },
    input.vault,
  );
}

export async function getNoteOutline(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteOutlineSchema>,
): Promise<NoteHeading[]> {
  requireOneOf({ file: input.file, path: input.path });
  const raw = await executor.runJson(
    "outline",
    { file: input.file, path: input.path },
    input.vault,
  );
  return z.array(noteHeadingSchema).parse(raw);
}

export async function getNoteWordcount(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteWordcountSchema>,
): Promise<string> {
  requireOneOf({ file: input.file, path: input.path });
  return executor.run("wordcount", { file: input.file, path: input.path }, input.vault);
}
