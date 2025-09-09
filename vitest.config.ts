import path from "node:path";
import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["build/**", ...configDefaults.exclude],
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
