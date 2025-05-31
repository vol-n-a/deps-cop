import path from "node:path";

import { readJavaScriptConfig } from "./readers/javascript.js";
import { readJsonConfig } from "./readers/json.js";
import { readTypeScriptConfig } from "./readers/typescript.js";
import { resolveDepscopConfig } from "./resolve-depscop-config.js";
import type { DepscopConfig } from "./types.js";

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
const possibleConfigPaths = EXTENSIONS_PRIORITY.map((extension) => ({
  path: path.resolve(process.cwd(), `${CONFIG_BASENAME}${extension}`),
  extension,
}));

/**
 * Loads and returns the contents of the depscop configuration file
 *
 * @returns Depscop config
 * @throws {Error} If the configuration file does not exist, cannot be read or is invalid
 */
export const readDepscopConfig = async (): Promise<DepscopConfig> => {
  // Try each file in sequence until we find one that works
  for (const { path: possibleConfigPath, extension } of possibleConfigPaths) {
    let defaultExport: unknown;

    if (extension === ".json") {
      try {
        defaultExport = await readJsonConfig(possibleConfigPath);
      } catch {
        // Continue to the next file
        continue;
      }
    } else if (
      extension === ".ts" ||
      extension === ".mts" ||
      extension === ".cts"
    ) {
      try {
        defaultExport = await readTypeScriptConfig(possibleConfigPath);
      } catch {
        // Continue to the next file
        continue;
      }
    } else {
      try {
        defaultExport = await readJavaScriptConfig(possibleConfigPath);
      } catch {
        // Continue to the next file
        continue;
      }
    }

    return await resolveDepscopConfig(defaultExport);
  }

  // None of the files worked
  throw new Error(
    `No configuration file found. Please create one of the following files in your project root: ${EXTENSIONS_PRIORITY.map((ext) => `${CONFIG_BASENAME}${ext}`).join(", ")}.`
  );
};
