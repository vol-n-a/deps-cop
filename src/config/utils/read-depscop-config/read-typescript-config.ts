import crypto from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Reads a TypeScript configuration file
 *
 * Transpiles the TypeScript file to JavaScript at runtime,
 * writes it to a temporary .mjs file in the current working directory
 * and dynamically imports the result to access its default export
 *
 * @param configPath - Path to the TypeScript configuration file
 * @returns The default export from the TypeScript file
 * @throws {Error} If TypeScript is not installed
 */
export const readTypeScriptConfig = async (
  configPath: string
): Promise<unknown> => {
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
  const tsContent = await readFile(configPath, "utf8");

  // Transpile to JavaScript and write to a cache file in node_modules/.cache/deps-cop
  const jsContent = transpileModule(tsContent, {
    compilerOptions: {
      module: ModuleKind.ES2015,
      target: ScriptTarget.ES2015,
    },
  }).outputText;

  // Importing from ESM modules that are strings is not directly supported in Node.js.
  // As a workaround, the JavaScript code is written to a temporary file amd is dynamicaly imported as the ESM module.
  // The temporary file is written to the current working directory to support relative imports.
  //
  // While browsers allow importing ESM modules from blob URLs,
  // this approach is not supported in the Node.js environment.
  // See: https://github.com/nodejs/node/issues/47573

  // Create a unique temp file path
  const tempFileName = `depscop-config-${crypto.randomUUID()}.mjs`;
  const tempFilePath = path.resolve(process.cwd(), tempFileName);
  const tempFileUrl = pathToFileURL(tempFilePath).href;

  // Write the code to the temp file
  await writeFile(tempFilePath, jsContent, "utf8");

  try {
    // Import the module using a file URL
    return (await import(tempFileUrl)).default;
  } finally {
    // Clean up the temp file
    await unlink(tempFilePath);
  }
};
