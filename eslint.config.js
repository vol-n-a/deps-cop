import eslint from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import tsEslint from "typescript-eslint";

const jsConfig = tsEslint.config({
  extends: [eslint.configs.recommended],
  ignores: ["bin/**"],
  files: ["**/*.js"],
  plugins: {
    "simple-import-sort": pluginSimpleImportSort,
    import: pluginImport,
  },
  rules: {
    "import/no-duplicates": "error",
    "no-magic-numbers": ["error", { ignore: [0, 1] }],
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
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
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

export default tsEslint.config(...jsConfig, ...tsConfig);
