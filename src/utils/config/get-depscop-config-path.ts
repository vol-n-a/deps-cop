import { access } from "node:fs/promises";
import path from "node:path";

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
 * Asynchronously locates and returns the path of the first accessible `depscop.config.*` file
 * in the current working directory, based on a predefined priority of file extensions.
 *
 * The function looks for configuration files with the following extensions (in order):
 * `.json`, `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`. All files are checked in parallel using
 * non-blocking file system access, and the first file that exists and is accessible is returned
 * as a filesystem path.
 *
 * @returns A promise that resolves to the filesystem path of the first accessible configuration file.
 *
 * @throws If no configuration file is found or none of them is accessible. The error message includes the list of tried filenames.
 */
export const getDepscopConfigPath = async (): Promise<string> => {
  const possiblePaths = EXTENSIONS_PRIORITY.map((ext) =>
    path.resolve(process.cwd(), `${CONFIG_BASENAME}${ext}`)
  );

  const accessiblePaths = possiblePaths.map(async (possiblePath) => {
    try {
      await access(possiblePath);
      return possiblePath;
    } catch {
      return null;
    }
  });

  const paths = await Promise.all(accessiblePaths);

  const firstPath = paths.find(Boolean);
  if (!firstPath) {
    throw new Error(
      `No configuration file found. Please create one of the following files in your project root: ${EXTENSIONS_PRIORITY.map((ext) => `${CONFIG_BASENAME}${ext}`).join(", ")}. Make sure the file is readable and accessible.`
    );
  }

  return firstPath;
};
