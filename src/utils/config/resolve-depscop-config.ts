import { isPromiseLike } from "../type-guards/is-promise-like.js";
import { isRecord } from "../type-guards/is-record.js";
import type { DepscopConfig } from "./types.js";

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
  defaultExport: unknown
): Promise<DepscopConfig> => {
  let config: unknown;

  if (typeof defaultExport === "function") {
    const result = defaultExport();
    config = isPromiseLike(result) ? await result : result;
  } else {
    config = defaultExport;
  }

  if (!isRecord(config)) {
    throw new Error("DepsCop configuration must be a JavaScript object");
  }

  return config as DepscopConfig;
};
