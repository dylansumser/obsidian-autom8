import { z } from "zod";
import type { ObsidianExecutor } from "./executor.js";

export const listTemplatesSchema = z.object({
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export const readTemplateSchema = z.object({
  name: z.string().describe("Template name"),
  resolve: z.boolean().optional().describe("Resolve template variables before returning"),
  title: z.string().optional().describe("Title value to use when resolving {{title}}"),
  vault: z.string().optional().describe("Vault name (overrides default)"),
});

export async function listTemplates(
  executor: ObsidianExecutor,
  input: z.infer<typeof listTemplatesSchema>,
): Promise<string> {
  return executor.run("templates", {}, input.vault);
}

export async function readTemplate(
  executor: ObsidianExecutor,
  input: z.infer<typeof readTemplateSchema>,
): Promise<string> {
  return executor.run(
    "template:read",
    { name: input.name, resolve: input.resolve, title: input.title },
    input.vault,
  );
}
