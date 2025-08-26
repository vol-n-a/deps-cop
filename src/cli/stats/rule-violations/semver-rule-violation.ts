import { RuleViolation, type RuleViolationOptions } from "./rule-violation.js";

export class SemverRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("semver", message, options);
  }
}
