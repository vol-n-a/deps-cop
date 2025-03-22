import type { RuleViolationOptions } from "./rule-violation.js";
import { RuleViolation } from "./rule-violation.js";

export class ForbiddenRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super(message, options);
    this.checkName = "forbidden";
  }
}
