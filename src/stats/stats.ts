import chalk from "chalk";

import type { RuleViolation } from "./rule-violations/rule-violation.js";
import { RuleViolationLevel } from "./rule-violations/rule-violation.js";

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
   * Prints info about all of the rule violations recorded to the `stdout` and `stderr` streams:
   * - If there are rule violations recorded, returns sorted errors/warnings messages and their amount
   * - If no rule violations recorded, ruturns success message
   *
   * @returns Rules violation info
   */
  public print = () => {
    if (!this.errors.length && !this.warnings.length) {
      console.log(chalk.green("✅ All dependencies are valid"));
      return;
    }

    if (this.errors.length) {
      this.errors.forEach((error) => {
        console.error(String(error));
      });
    }

    if (this.warnings.length) {
      this.warnings.forEach((warning) => {
        console.warn(String(warning));
      });
    }

    console.error(
      `\n${chalk.red(`${this.errors.length} errors`)}, ${chalk.yellow(
        `${this.warnings.length} warnings`
      )}`
    );
  };
}

export const stats = new Stats();
