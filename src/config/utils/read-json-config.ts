import { pathToFileURL } from "node:url";

/**
 * Reads a JSON configuration file
 *
 * @param path - Path to the JSON configuration file
 * @returns The default export from the JSON file
 */
export const readJsonConfig = async (path: string): Promise<unknown> => {
  const url = pathToFileURL(path).href;
  return (await import(url, { assert: { type: "json" } })).default;
};
