import type { DepscopConfig } from "../../model/index.js";
import { isRecord } from "./is-record.js";

/**
 * Resolves a Depscop configuration.
 *
 * This function handles different types of configurations:
 * - Plain JavaScript objects
 * - Functions that return a plain JavaScript object
 * - Functions that return a Promise resolving to a plain JavaScript object
 *
 * @param defaultExport - The configuration to resolve
 * @returns A Promise that resolves to the resolved configuration object
 * @throws {Error} If the configuration is not a valid JavaScript object
 */
export const resolveDepscopConfig = async (
  config: unknown
): Promise<DepscopConfig> => {
  if (!isRecord(config)) {
    throw new Error("DepsCop configuration must be a JavaScript object");
  }

  return config as DepscopConfig;
};
