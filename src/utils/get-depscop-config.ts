import { readFile } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

type Version = string;
type Reason = string;

export type DepscopConfig = Record<string, [Version, Reason]>;

const depscopConfigPath = path.resolve(process.cwd(), "depscop.config.json");

/**
 * Reads depscop config and parses it to the js object
 *
 * Config file is searched in the following paths:
 * - \<root>/depscop.config.json
 *
 * @returns Depscop config
 */
export const getDepscopConfig = async (): Promise<DepscopConfig> => {
  const readFilePromise = promisify(readFile);

  const file = await readFilePromise(depscopConfigPath, "utf-8");

  return JSON.parse(file) as DepscopConfig;
};
