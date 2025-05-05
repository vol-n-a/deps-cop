import { getDepscopConfigUrl } from "./get-depscop-config-url.js";

export type Version = string;
export type Reason = string;
export type DependencyName = string;

export type Rule = [Version, Reason];
type Rules = Array<Rule>;
type RuleSet = Rule | Rules;

declare const __brand: unique symbol;
type RulesRecord<brand extends string> = Record<DependencyName, RuleSet> & {
  [__brand]: brand;
};

// TODO: Add rule level: 'warning' | 'error" (?)
export type ForbiddenRules = RulesRecord<"forbidden">;
export type RecentRules = RulesRecord<"recent">;
export type SemverRules = RulesRecord<"semver">;

export type DepscopConfig = {
  forbidden: ForbiddenRules;
  recent: RecentRules;
  semver: SemverRules;
};

/**
 * Loads and returns the contents of the depscop configuration file
 *
 * @returns Depscop config
 */
export const getDepscopConfig = async (): Promise<DepscopConfig> => {
  const url = await getDepscopConfigUrl();

  if (url.endsWith(".json")) {
    return (await import(url, { assert: { type: "json" } })).default;
  }

  return (await import(url)).default;
};
