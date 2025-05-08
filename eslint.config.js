import eslint from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tsEslint from "typescript-eslint";

const baseConfig = tsEslint.config({
  languageOptions: { globals: globals.node },
});

const jsConfig = tsEslint.config({
  extends: [...baseConfig, eslint.configs.recommended],
  files: ["**/*.js"],
  ignores: ["build/**", "node_modules/**"],
  plugins: {
    "simple-import-sort": pluginSimpleImportSort,
    import: pluginImport,
  },
  rules: {
    "import/no-duplicates": "error",
    "no-magic-numbers": ["error", { ignore: [-1, 0, 1] }],
    "no-shadow": "error",
    "object-shorthand": ["error", "always"],
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // Side-effect imports
          ["^\u0000"],
          // External libraries imports
          ["^"],
          // Src imports
          ["^src"],
          // Relative imports
          ["^\\."],
        ],
      },
    ],
    quotes: ["error", "double"],
  },
});

const tsConfig = tsEslint.config({
  extends: [...jsConfig, ...tsEslint.configs.strict],
  files: ["**/*.ts"],
  ignores: ["build/**", "node_modules/**"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.url,
    },
  },
  rules: {
    "@typescript-eslint/consistent-type-imports": ["error"],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
});

export default tsEslint.config(
  eslintPluginPrettierRecommended,
  ...jsConfig,
  ...tsConfig
);
