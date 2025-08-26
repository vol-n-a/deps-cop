import type { RuleViolationOptions } from "../../../../stats/index.js";
import { RuleViolation } from "../../../../stats/index.js";

export class SemverRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("semver", message, options);
  }
}
