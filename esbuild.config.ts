import esbuild, { type BuildOptions } from "esbuild";

const options: BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  outfile: "dist/obsidian-autom8.cjs",
};

await esbuild.build(options);

console.log("Build complete → dist/obsidian-autom8.cjs");
