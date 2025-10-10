declare const __brand: unique symbol;

type Version = string;
type Reason = string;
type DependencyName = string;

enum Severity {
  "ERROR" = "error",
  "WARNING" = "warning",
}

type RuleOptions = {
  /**
   * Controls how rule violations are handled.
   *
   * `"error"` violations cause the `depscop` command to exit with code 1,
   * while `"warning"` violations are reported but don't cause failure.
   */
  severity?: Severity;
};

// --- ALLOWED RULESET ---

type AllowedRule = [Version, Reason, RuleOptions?];

type AllowedRuleset = Record<
  DependencyName,
  AllowedRule | Array<AllowedRule>
> & {
  [__brand]?: "allowed";
};

// --- FORBIDDEN RULESET ---

type ForbiddenRule = [Version, Reason, RuleOptions?];

type ForbiddenRuleset = Record<
  DependencyName,
  ForbiddenRule | Array<ForbiddenRule>
> & {
  [__brand]?: "forbidden";
};

// --- RECENT RULESET ---

type RecentRuleOptions = RuleOptions & {
  /**
   * Controls whether prerelease versions (e.g., alpha, beta, rc) are included when determining recent versions.
   *
   * If `true`, prerelease versions are considered when evaluating the most recent versions for the rule.
   * If `false`, prerelease versions are excluded from the calculation.
   *
   * This option only affects the `recent` ruleset.
   */
  prerelease?: boolean;
};

type RecentRule = [Version, Reason, RecentRuleOptions?];

type RecentRuleset = Record<DependencyName, RecentRule | Array<RecentRule>> & {
  [__brand]?: "recent";
};

// --- DEPSCOP CONFIG ---

type DepscopConfig = {
  allowed?: AllowedRuleset;
  forbidden?: ForbiddenRuleset;
  recent?: RecentRuleset;
};

export type {
  AllowedRule,
  AllowedRuleset,
  DependencyName,
  DepscopConfig,
  ForbiddenRule,
  ForbiddenRuleset,
  Reason,
  RecentRule,
  RecentRuleset,
  RuleOptions,
  Version,
};
export { Severity };
