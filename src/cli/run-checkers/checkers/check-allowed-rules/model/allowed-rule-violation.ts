import type { RuleViolationOptions } from "../../../../stats/index.js";
import { RuleViolation } from "../../../../stats/index.js";

export class AllowedRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("allowed", message, options);
  }
}
