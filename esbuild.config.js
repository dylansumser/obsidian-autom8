import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: "dist/obsidian-autom8.cjs",
});

console.log("Build complete → dist/obsidian-autom8.cjs");
