import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Keep tests independent of the portfolio's Vite configuration when nested.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
