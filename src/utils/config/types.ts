export type Version = string;
export type Reason = string;
export type DependencyName = string;

// TODO: Add rule level: 'warning' | 'error" (?)
// TODO: Add prerelease flag
export type Rule = [Version, Reason];
type Rules = Array<Rule>;
type RuleSet = Rule | Rules;

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
