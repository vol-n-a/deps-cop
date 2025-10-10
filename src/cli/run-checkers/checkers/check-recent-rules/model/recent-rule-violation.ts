import type { RuleViolationOptions } from "../../../../stats/index.js";
import { RuleViolation } from "../../../../stats/index.js";

export class RecentRuleViolation extends RuleViolation {
  constructor(message: string, options?: RuleViolationOptions) {
    super("recent", message, options);
  }
}
