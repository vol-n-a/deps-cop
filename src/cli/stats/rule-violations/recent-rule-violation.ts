import { RuleViolation, type RuleViolationOptions } from "./rule-violation.js";

export class RecentRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("recent", message, options);
  }
}
