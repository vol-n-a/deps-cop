import { coverageConfigDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      exclude: ["build/**", ...coverageConfigDefaults.exclude],
    },
  },
  resolve: {
    alias: {
      src: path.resolve(process.cwd(), "src"),
    },
  },
});
