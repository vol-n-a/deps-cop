import chalk from "chalk";

import type { RuleViolation } from "./rule-violations/rule-violation";
import { RuleViolationLevel } from "./rule-violations/rule-violation";

class Stats {
  private errors: Array<RuleViolation> = [];
  private warnings: Array<RuleViolation> = [];

  /**
   * Records rule violation to stats' storage
   */
  public addRuleViolation = (ruleViolation: RuleViolation): void => {
    if (ruleViolation.level === RuleViolationLevel.WARNING) {
      this.warnings.push(ruleViolation);
      return;
    }

    this.errors.push(ruleViolation);
  };

  /**
   * Generates info about all of the rule violations recorded:
   * - If there are rule violations recorded, returns sorted errors/warnings messages and their amount
   * - If no rule violations recorded, ruturns success message
   *
   * @returns Rules violation info
   */
  public getInfo = () => {
    if (!this.errors.length && !this.warnings.length) {
      return chalk.green("✅ All dependencies are valid");
    }

    const stringBuilder = [];

    if (this.errors.length) {
      stringBuilder.push(this.errors.join("\n"));
    }

    if (this.warnings.length) {
      stringBuilder.push(this.warnings.join("\n"));
    }

    stringBuilder.push(
      `${chalk.red(`${this.errors.length} errors`)}, ${chalk.yellow(
        `${this.warnings.length} warnings`
      )}`
    );

    return stringBuilder.join("\n\n");
  };
}

export const stats = new Stats();
