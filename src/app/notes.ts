import { z } from "zod";
import { parse as parseYaml } from "yaml";
import type { ObsidianExecutor } from "./executor.js";
import { buildFrontmatter } from "./frontmatter.js";

export const readNoteSchema = z.object({
  path: z.string().describe("Exact vault-relative file path e.g. folder/note.md"),
});

export const createNoteSchema = z.object({
  path: z
    .string()
    .describe("Exact path e.g. folder/note.md — intermediate folders are created automatically"),
  content: z.string().optional().describe("Note body (markdown)"),
  properties: z
    .record(z.unknown())
    .optional()
    .describe("Frontmatter properties — merged above content"),
  template: z.string().optional().describe("Template name to apply on creation"),
});

export const editNoteSchema = z.object({
  path: z.string().describe("Exact vault-relative file path e.g. folder/note.md"),
  old_string: z.string().describe("Exact text block to replace"),
  new_string: z.string().describe("Replacement text"),
});

export const appendToNoteSchema = z.object({
  content: z.string().describe("Content to append"),
  path: z.string().describe("Exact file path"),
  inline: z.boolean().optional().describe("Append without a leading newline"),
});

export const prependToNoteSchema = z.object({
  content: z.string().describe("Content to prepend"),
  path: z.string().describe("Exact file path"),
  inline: z.boolean().optional().describe("Prepend without a trailing newline"),
});

export const deleteNoteSchema = z.object({
  path: z.string().describe("Exact file path"),
  permanent: z.boolean().optional().describe("Skip trash and delete permanently"),
});

export const moveNoteSchema = z.object({
  path: z.string().describe("Exact source file path"),
  destination: z.string().describe("Destination path e.g. folder/note.md"),
});

export const renameNoteSchema = z.object({
  path: z.string().describe("Exact file path"),
  name: z.string().describe("New note name (without .md extension)"),
});

export const getNoteOutlineSchema = z.object({
  path: z.string().describe("Exact file path"),
});

export const noteHeadingSchema = z.object({
  level: z.number(),
  heading: z.string(),
  line: z.number(),
});
export type NoteHeading = z.infer<typeof noteHeadingSchema>;

export const getNoteWordcountSchema = z.object({
  path: z.string().describe("Exact file path"),
});

export async function readNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof readNoteSchema>,
): Promise<{ properties: Record<string, unknown>; content: string }> {
  const raw = await executor.run("read", { path: input.path });
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/);
  if (fmMatch) {
    return {
      properties: parseYaml(fmMatch[1]) as Record<string, unknown>,
      content: fmMatch[2],
    };
  }
  return { properties: {}, content: raw };
}

export async function createNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof createNoteSchema>,
): Promise<void> {
  let fullContent = input.content ?? "";
  if (input.properties && Object.keys(input.properties).length > 0) {
    fullContent = `${buildFrontmatter(input.properties as Record<string, unknown>)}\n\n${fullContent}`;
  }
  await executor.run("create", {
    path: input.path,
    content: fullContent || undefined,
    template: input.template,
  });
}

export async function editNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof editNoteSchema>,
): Promise<void> {
  const original = await executor.run("read", { path: input.path });
  const occurrences = original.split(input.old_string).length - 1;
  if (occurrences === 0) {
    throw new Error(
      `edit_note: old_string not found in ${input.path} — ensure text matches exactly (including whitespace)`,
    );
  }
  if (occurrences > 1) {
    throw new Error(
      `edit_note: old_string matches ${occurrences} occurrences in ${input.path} — include more surrounding context to make it unique`,
    );
  }
  await executor.run("create", {
    path: input.path,
    content: original.replace(input.old_string, input.new_string),
    overwrite: true,
  });
}

export async function appendToNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof appendToNoteSchema>,
): Promise<void> {
  await executor.run("append", {
    content: input.content,
    path: input.path,
    inline: input.inline,
  });
}

export async function prependToNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof prependToNoteSchema>,
): Promise<void> {
  await executor.run("prepend", {
    content: input.content,
    path: input.path,
    inline: input.inline,
  });
}

export async function deleteNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof deleteNoteSchema>,
): Promise<void> {
  await executor.run("delete", { path: input.path, permanent: input.permanent });
}

export async function moveNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof moveNoteSchema>,
): Promise<void> {
  await executor.run("move", { path: input.path, to: input.destination });
}

export async function renameNote(
  executor: ObsidianExecutor,
  input: z.infer<typeof renameNoteSchema>,
): Promise<void> {
  await executor.run("rename", { path: input.path, name: input.name });
}

export async function getNoteOutline(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteOutlineSchema>,
): Promise<NoteHeading[]> {
  const raw = await executor.runJson("outline", { path: input.path });
  return z.array(noteHeadingSchema).parse(raw);
}

export async function getNoteWordcount(
  executor: ObsidianExecutor,
  input: z.infer<typeof getNoteWordcountSchema>,
): Promise<string> {
  return executor.run("wordcount", { path: input.path });
}
