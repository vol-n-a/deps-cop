import { pathToFileURL } from "node:url";

/**
 * Reads a JavaScript configuration file
 *
 * @param path - Path to the JavaScript configuration file
 * @returns The default export from the file
 */
export const readJavaScriptConfig = async (path: string): Promise<unknown> => {
  const url = pathToFileURL(path).href;
  return (await import(url)).default;
};
