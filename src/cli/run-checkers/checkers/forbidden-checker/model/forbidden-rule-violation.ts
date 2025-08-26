import type { RuleViolationOptions } from "../../../../stats/index.js";
import { RuleViolation } from "../../../../stats/index.js";

export class ForbiddenRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("forbidden", message, options);
  }
}
