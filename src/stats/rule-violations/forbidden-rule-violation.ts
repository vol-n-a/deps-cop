import { RuleViolation, type RuleViolationOptions } from "./rule-violation.js";

export class ForbiddenRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("forbidden", message, options);
  }
}
