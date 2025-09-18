import path from "node:path";

import type { DepscopConfig } from "../../model/index.js";
import { resolveDepscopConfig } from "../resolve-depscop-config/resolve-depscop-config.js";
import { importJSModuleDefaultExport } from "./import-js-module-default-export.js";
import { importJSONModule } from "./import-json-module.js";
import { importTSModuleDefaultExport } from "./import-ts-module-default-export.js";
import { isModuleNotFoundError } from "./is-module-not-found-error.js";

const CONFIG_BASENAME = "depscop.config";
const EXTENSIONS_PRIORITY = [".json", ".ts", ".mts", ".js", ".mjs"] as const;
const possibleConfigPaths = EXTENSIONS_PRIORITY.map((extension) => ({
  path: path.resolve(process.cwd(), `${CONFIG_BASENAME}${extension}`),
  extension,
}));

/**
 * Loads and returns the contents of the depscop configuration file
 *
 * The function looks for depscop.config files with the following extensions (in order):
 * `.json`, `.ts`, `.mts`, `.js`, `.mjs`
 *
 * @returns Depscop config
 * @throws {Error} If the configuration file does not exist, can not be read or is invalid
 */
export const readDepscopConfig = async (): Promise<DepscopConfig> => {
  // Try each file according to extension priority until a valid config file is found
  for (const { path: possibleConfigPath, extension } of possibleConfigPaths) {
    let defaultExport: unknown;

    try {
      if (extension === ".json") {
        defaultExport = await importJSONModule(possibleConfigPath);
      } else if (extension === ".ts" || extension === ".mts") {
        defaultExport = await importTSModuleDefaultExport(possibleConfigPath);
      } else {
        defaultExport = await importJSModuleDefaultExport(possibleConfigPath);
      }
    } catch (error) {
      // If module not found, continue to the next file
      if (isModuleNotFoundError(error)) {
        continue;
      }

      throw new Error(`Error reading ${possibleConfigPath}: ${error}`);
    }

    return await resolveDepscopConfig(defaultExport);
  }

  // None of the files worked
  throw new Error(
    `No configuration file found. Please create one of the following files in your project root: ${EXTENSIONS_PRIORITY.map((ext) => `${CONFIG_BASENAME}${ext}`).join(", ")}.`
  );
};
