import { pathToFileURL } from "node:url";

/**
 * Reads a JSON module.
 *
 * @param path - Path to the JSON configuration file
 * @returns The default export from the JSON module
 */
export const importJSONModule = async (path: string): Promise<unknown> => {
  const url = pathToFileURL(path).href;
  return (await import(url, { assert: { type: "json" } })).default;
};
