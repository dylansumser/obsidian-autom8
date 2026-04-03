import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      OBSIDIAN_VAULT: process.env.OBSIDIAN_VAULT ?? "test-vault",
    },
    testTimeout: 15_000,
    globalSetup: "./test/global-setup.ts",
    // Run test files sequentially — all tests share a single Obsidian IPC
    // connection and the executor mutex only serialises within a single process.
    fileParallelism: false,
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["test/integration/**"],
  },
});
