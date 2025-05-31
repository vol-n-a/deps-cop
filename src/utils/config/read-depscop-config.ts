import { getDepscopConfigPath } from "./get-depscop-config-path.js";
import { readJavaScriptConfig } from "./readers/javascript.js";
import { readJsonConfig } from "./readers/json.js";
import { readTypeScriptConfig } from "./readers/typescript.js";
import { resolveDepscopConfig } from "./resolve-depscop-config.js";
import type { DepscopConfig } from "./types.js";

/**
 * Loads and returns the contents of the depscop configuration file
 *
 * @returns Depscop config
 */
export const readDepscopConfig = async (): Promise<DepscopConfig> => {
  const path = await getDepscopConfigPath();
  let defaultExport: unknown;

  if (path.endsWith(".json")) {
    defaultExport = await readJsonConfig(path);
  } else if (
    path.endsWith(".ts") ||
    path.endsWith(".mts") ||
    path.endsWith(".cts")
  ) {
    defaultExport = await readTypeScriptConfig(path);
  } else {
    defaultExport = await readJavaScriptConfig(path);
  }

  if (!defaultExport) {
    throw new Error("No default export found in the configuration file");
  }

  return await resolveDepscopConfig(defaultExport);
};
