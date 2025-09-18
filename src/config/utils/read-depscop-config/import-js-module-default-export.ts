import { pathToFileURL } from "node:url";

/**
 * Imports the default export from a JavaScript module.
 *
 * @param path - Path to the JavaScript file
 * @returns The default export from the module
 * @throws {Error} If there is no default export
 */
export const importJSModuleDefaultExport = async (
  path: string
): Promise<unknown> => {
  const url = pathToFileURL(path).href;
  const module = await import(url);

  if (!("default" in module)) {
    throw new Error(
      `No default export found in JavaScript config file at ${path}`
    );
  }

  return module.default;
};
