import path from "node:path";

import type { DepscopConfig } from "../../model/index.js";
import { resolveDepscopConfig } from "../resolve-depscop-config/resolve-depscop-config.js";
import { importJSModuleDefaultExport } from "./import-js-module-default-export.js";
import { importJSONModule } from "./import-json-module.js";
import { importTSModuleDefaultExport } from "./import-ts-module-default-export.js";
import { isModuleNotFoundError } from "./is-module-not-found-error.js";

const CONFIG_BASENAME = "depscop.config";
const CONFIGS_INFO = [
  { extension: ".json", importFn: importJSONModule },
  { extension: ".ts", importFn: importTSModuleDefaultExport },
  { extension: ".mts", importFn: importTSModuleDefaultExport },
  { extension: ".js", importFn: importJSModuleDefaultExport },
  { extension: ".mjs", importFn: importJSModuleDefaultExport },
];

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
  // Calculate config paths at function execution time
  // (not at module load) to always use the current working directory
  const cwd = process.cwd();

  // Try each file according to extension priority until a valid config file is found
  for (const { extension, importFn } of CONFIGS_INFO) {
    const configPath = path.join(cwd, `${CONFIG_BASENAME}${extension}`);

    try {
      const rawConfig = await importFn(configPath);
      const config =
        typeof rawConfig === "function" ? await rawConfig() : rawConfig;

      return await resolveDepscopConfig(config);
    } catch (error) {
      // If module not found, continue to the next file
      if (isModuleNotFoundError(error)) {
        continue;
      }

      throw new Error(`Error processing ${configPath}: ${getMessage(error)}`);
    }
  }

  // None of the files worked
  throw new Error(
    `No configuration file found. Please create one of the following files in your project root: ${CONFIGS_INFO.map(({ extension }) => `${CONFIG_BASENAME}${extension}`).join(", ")}.`
  );
};

const getMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String(error.message)
    : String(error);
