/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.config.{js,ts}",
        "**/*.mjs",
        "dist",
        "e2e",
        "playwright.config.ts",
      ],
    },
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".astro", "dist", "e2e", "playwright.config.ts", "__mocks__"],
    alias: {
      "@": resolve(__dirname, "./src"),
      "astro:transitions/client": resolve(__dirname, "./__mocks__/astro.ts"),
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
