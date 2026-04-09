# MCP Tools Reference

All tools exposed by the MCP server and their equivalent Obsidian CLI commands.

---

## Vault

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_vaults` | `vaults` | List all vaults registered with Obsidian |
| `get_vault_info` | `vault` | Show info about the current vault (name, path, file/folder counts) |

## Notes

| MCP Tool | CLI Command | Description |
|---|---|---|
| `create_note` | `create` | Create a note at an exact path, optionally from a template |
| `read_note` | `read` | Read a note — returns `{ properties, content }` (parsed frontmatter + body) |
| `edit_note` | *(fs direct)* | Replace a unique block of text in a note (`old_string` → `new_string`); errors if `old_string` matches 0 or 2+ times — expand context to disambiguate |
| `append_to_note` | `append` | Append content to a note |
| `prepend_to_note` | `prepend` | Prepend content after frontmatter |
| `delete_note` | `delete` | Delete a note (trash by default) |
| `move_note` | `move` | Move a note to a new path, updating internal links |
| `rename_note` | `rename` | Rename a note, updating internal links |

## Files & Folders

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_files` | `files` | List files in the vault, optionally filtered by folder or extension |
| `get_file_info` | `file` | Get metadata for a file (size, created, modified) |
| `list_folders` | `folders` | List folders in the vault |
| `get_folder_info` | `folder` | Get info about a folder |

## Search

| MCP Tool | CLI Command | Description |
|---|---|---|
| `search_vault` | `search` / `search:context` | Search vault for text. Returns file paths by default; set `includeContext: true` for grep-style line matches |

## Tags & Properties

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_tags` | `tags` | List all tags in the vault with optional counts |
| `get_tag_info` | `tag` | Get info and occurrence count for a specific tag |
| `list_properties` | `properties` | List all properties across the vault |
| `list_aliases` | `aliases` | List all aliases in the vault |
| `get_property` | `property:read` | Read a property value from a note |
| `set_property` | `property:set` | Set a property on a note |
| `remove_property` | `property:remove` | Remove a property from a note |

## Tasks

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_tasks` | `tasks` | List tasks, optionally filtered by file, status, or daily note |
| `toggle_task` | `task toggle` | Toggle a task's completion status |
| `set_task_status` | `task status=<char>` | Set a task to a specific status character |

## Daily Notes

| MCP Tool | CLI Command | Description |
|---|---|---|
| `get_daily_note_path` | `daily:path` | Get the expected path for today's daily note |
| `read_daily_note` | `daily:read` | Read today's daily note |
| `append_to_daily_note` | `daily:append` | Append content to today's daily note |
| `prepend_to_daily_note` | `daily:prepend` | Prepend content to today's daily note |

## Links & Graph

| MCP Tool | CLI Command | Description |
|---|---|---|
| `get_note_backlinks` | `backlinks` | List backlinks to a note |
| `get_note_links` | `links` | List outgoing links from a note |
| `list_unresolved_links` | `unresolved` | List unresolved links across the vault |
| `list_orphan_notes` | `orphans` | List notes with no incoming links |
| `list_deadend_notes` | `deadends` | List notes with no outgoing links |

## Outline & Wordcount

| MCP Tool | CLI Command | Description |
|---|---|---|
| `get_note_outline` | `outline` | Show headings for a note |
| `get_note_wordcount` | `wordcount` | Count words and characters in a note |

## Templates

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_templates` | `templates` | List available templates |
| `read_template` | `template:read` | Read a template's content |

## Bookmarks

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_bookmarks` | `bookmarks` | List all bookmarks |
| `add_bookmark` | `bookmark` | Add a bookmark (file, folder, search, or URL) |

## Commands

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_commands` | `commands` | List all available Obsidian command IDs |
| `execute_command` | `command` | Execute an Obsidian command by ID |

## File History

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_history_files` | `history:list` | List all files that have local history |
| `list_note_versions` | `history` / `diff` | List available versions of a note |
| `read_note_version` | `history:read` | Read a specific historical version of a note |
| `restore_note_version` | `history:restore` | Restore a note to a prior version |
| `diff_note` | `diff` | Compare two versions of a note |

## Bases

| MCP Tool | CLI Command | Description |
|---|---|---|
| `list_bases` | `bases` | List all `.base` files in the vault |
| `list_base_views` | `base:views` | List views in a base file |
| `query_base` | `base:query` | Query a base and return results |
| `create_base_item` | `base:create` | Create a new item in a base |

---

> Planned additions and the project roadmap are tracked in [CONTRIBUTING.md](../CONTRIBUTING.md#roadmap--planned-additions).
