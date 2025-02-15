const eslint = require("@eslint/js");
const pluginImport = require("eslint-plugin-import");
const pluginSimpleImportSort = require("eslint-plugin-simple-import-sort");
const tsEslint = require("typescript-eslint");
const globals = require("globals");

const NODE_FILES = [
  // Config files
  "**/eslint.config.js",
];

const nodeEnvironmentConfig = tsEslint.config({
  files: NODE_FILES,
  languageOptions: { globals: globals.node },
});

const jsConfig = tsEslint.config({
  extends: [eslint.configs.recommended],
  ignores: ["build/**"],
  files: ["**/*.js"],
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
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
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

module.exports = tsEslint.config(
  ...nodeEnvironmentConfig,
  ...jsConfig,
  ...tsConfig
);
