import type { RuleViolationOptions } from "./rule-violation";
import { RuleViolation } from "./rule-violation";

export class RecentRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super(message, options);
    this.checkName = "recent";
  }
}
