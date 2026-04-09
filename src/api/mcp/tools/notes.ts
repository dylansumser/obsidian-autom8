import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ObsidianExecutor } from "../../../app/executor.js";
import { text } from "./utils.js";
import {
  readNoteSchema,
  readNote,
  createNoteSchema,
  createNote,
  editNoteSchema,
  editNote,
  appendToNoteSchema,
  appendToNote,
  prependToNoteSchema,
  prependToNote,
  deleteNoteSchema,
  deleteNote,
  moveNoteSchema,
  moveNote,
  renameNoteSchema,
  renameNote,
  getNoteOutlineSchema,
  getNoteOutline,
  getNoteWordcountSchema,
  getNoteWordcount,
} from "../../../app/notes.js";

export function registerTools(server: McpServer, executor: ObsidianExecutor): void {
  server.registerTool(
    "read_note",
    {
      description:
        "Read a note by exact vault-relative path. Returns JSON with `properties` (parsed YAML frontmatter) and `content` (note body without frontmatter).",
      inputSchema: readNoteSchema.shape,
    },
    async (input) => text(await readNote(executor, input)),
  );

  server.registerTool(
    "create_note",
    {
      description:
        "Create a new note at the given path. Provide properties to auto-generate YAML frontmatter. " +
        "Intermediate folders are created automatically.",
      inputSchema: createNoteSchema.shape,
    },
    async (input) => text(await createNote(executor, input)),
  );

  server.registerTool(
    "edit_note",
    {
      description:
        "Replace an exact block of text in a note. Provide old_string (the exact text to replace) and new_string (the replacement). " +
        "Replaces the first occurrence only. Throws if old_string is not found.",
      inputSchema: editNoteSchema.shape,
    },
    async (input) => text(await editNote(executor, input)),
  );

  server.registerTool(
    "append_to_note",
    {
      description: "Append content to the end of an existing note.",
      inputSchema: appendToNoteSchema.shape,
    },
    async (input) => text(await appendToNote(executor, input)),
  );

  server.registerTool(
    "prepend_to_note",
    {
      description: "Prepend content to the beginning of an existing note.",
      inputSchema: prependToNoteSchema.shape,
    },
    async (input) => text(await prependToNote(executor, input)),
  );

  server.registerTool(
    "delete_note",
    {
      description:
        "Delete a note. Moves to system trash by default; use permanent=true to delete immediately.",
      inputSchema: deleteNoteSchema.shape,
    },
    async (input) => text(await deleteNote(executor, input)),
  );

  server.registerTool(
    "move_note",
    {
      description:
        "Move a note to a new path within the vault. " +
        "The destination folder must already exist — use create_note with a nested path to create folders first.",
      inputSchema: moveNoteSchema.shape,
    },
    async (input) => text(await moveNote(executor, input)),
  );

  server.registerTool(
    "rename_note",
    {
      description: "Rename a note (updates all wikilinks in the vault automatically).",
      inputSchema: renameNoteSchema.shape,
    },
    async (input) => text(await renameNote(executor, input)),
  );

  server.registerTool(
    "get_note_outline",
    {
      description: "Get the heading outline of a note as a structured list.",
      inputSchema: getNoteOutlineSchema.shape,
    },
    async (input) => text(await getNoteOutline(executor, input)),
  );

  server.registerTool(
    "get_note_wordcount",
    {
      description: "Get the word count and character count of a note.",
      inputSchema: getNoteWordcountSchema.shape,
    },
    async (input) => text(await getNoteWordcount(executor, input)),
  );
}
