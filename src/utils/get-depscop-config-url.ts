import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONFIG_BASENAME = "depscop.config";
const EXTENSIONS_PRIORITY = [
  ".json",
  ".ts",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
];

/**
 * Asynchronously locates and returns the URL of the first accessible `depscop.config.*` file
 * in the current working directory, based on a predefined priority of file extensions.
 *
 * The function looks for configuration files with the following extensions (in order):
 * `.json`, `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`. All files are checked in parallel using
 * non-blocking file system access, and the first file that exists and is accessible is returned
 * as a `file://` URL.
 *
 * @returns A promise that resolves to the `file://` URL of the first accessible configuration file.
 *
 * @throws If no configuration file is found or none of them is accessible. The error message includes the list of tried filenames.
 */
export const getDepscopConfigUrl = async (): Promise<string> => {
  const possibleUrls = EXTENSIONS_PRIORITY.map((ext) =>
    path.resolve(process.cwd(), `${CONFIG_BASENAME}${ext}`)
  );

  const accessibleUrls = possibleUrls.map(async (possibleUrl) => {
    try {
      await access(possibleUrl);
      return possibleUrl;
    } catch {
      return null;
    }
  });

  const urls = await Promise.all(accessibleUrls);

  const firstUrl = urls.find(Boolean);
  if (!firstUrl) {
    throw new Error(
      `No config file found or none of them is not accessible. Accepted config files: ${EXTENSIONS_PRIORITY.map((ext) => `${CONFIG_BASENAME}${ext}`).join(", ")}`
    );
  }

  return pathToFileURL(firstUrl).href;
};
