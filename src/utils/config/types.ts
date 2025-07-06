export type Version = string;
export type Reason = string;
export type DependencyName = string;

export enum Severity {
  "ERROR" = "error",
  "WARNING" = "warning",
}

// TODO: Add prerelease flag
export interface RuleOptions {
  /**
   * Controls how rule violations are handled.
   *
   * `"error"` violations cause the `depscop` command to exit with code 1,
   * while `"warning"` violations are reported but don't cause failure.
   */
  severity?: Severity;
}

export type Rule = [Version, Reason, RuleOptions?];

type RuleSet = Rule | Array<Rule>;

declare const __brand: unique symbol;
type RulesRecord<brand extends string> = Record<DependencyName, RuleSet> & {
  [__brand]?: brand;
};

export type ForbiddenRules = RulesRecord<"forbidden">;
export type RecentRules = RulesRecord<"recent">;
export type SemverRules = RulesRecord<"semver">;

export type DepscopConfig = {
  forbidden?: ForbiddenRules;
  recent?: RecentRules;
  semver?: SemverRules;
};
