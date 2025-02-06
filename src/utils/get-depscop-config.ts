import { readFile } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

export type Version = string;
export type Reason = string;

declare const __brand: unique symbol;
type RulesRecord<brand extends string> = Record<string, [Version, Reason]> & {
  [__brand]: brand;
};
export type ForbiddenRules = RulesRecord<"forbidden">;
// TODO: Сделать возможность передачи массива массивов для правил вида `react: [["18.0.0", "Reason 1"], ["18.2.0", "Reason 2"]]`
export type RecentRules = RulesRecord<"recent">;
export type SemverRules = RulesRecord<"semver">;

export type DepscopConfig = {
  forbidden: ForbiddenRules;
  recent: RecentRules;
  semver: SemverRules;
};

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
