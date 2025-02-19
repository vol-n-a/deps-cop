import type { RuleViolationOptions } from "./rule-violation";
import { RuleViolation } from "./rule-violation";

export class SemverRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super(message, options);
    this.checkName = "semver";
  }
}
