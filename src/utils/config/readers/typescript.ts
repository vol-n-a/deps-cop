import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

/**
 * Reads a TypeScript configuration file
 *
 * @param path - Path to the TypeScript configuration file
 * @returns The default export from the TypeScript file
 * @throws {Error} If TypeScript is not installed
 */
export const readTypeScriptConfig = async (path: string): Promise<unknown> => {
  let typescript;
  try {
    typescript = await import("typescript");
  } catch {
    throw new Error(
      "TypeScript is required to process .ts configuration files. Please install it as a dependency."
    );
  }

  const { ModuleKind, ScriptTarget, transpileModule } = typescript;

  // Read the TypeScript file
  const tsContent = await readFile(path, "utf8");

  // Transpile to JavaScript
  const jsContent = transpileModule(tsContent, {
    compilerOptions: {
      module: ModuleKind.NodeNext,
      target: ScriptTarget.ES2015,
    },
  }).outputText;

  // Create a temporary module and evaluate it
  const tempModule = new Function("exports", "require", jsContent);
  const exports: { default?: unknown } = {};
  const require = createRequire(import.meta.url);
  tempModule(exports, require);

  return exports.default;
};
