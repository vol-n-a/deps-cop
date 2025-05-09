import chalk from "chalk";

import type { Options } from "../command.js";
import type { RuleViolation } from "./rule-violations/rule-violation.js";
import { RuleViolationLevel } from "./rule-violations/rule-violation.js";

class Stats {
  private errors: Array<RuleViolation> = [];
  private warnings: Array<RuleViolation> = [];
  private options: Options | null = null;

  public init(options: Options) {
    this.options = options;
  }

  /**
   * Asserts whether `options` is initialized or not
   *
   * @param options
   *
   * @throws if `options === null`
   */
  private assertIsOptionsInitialized: (
    options: Options | null
  ) => asserts options is Options = (options) => {
    if (options === null) {
      throw new Error(
        "Stats instance is not initialized. Call stats.init(options) before using this object"
      );
    }
  };

  /**
   * Records rule violation to stats' storage
   */
  public addRuleViolation = (ruleViolation: RuleViolation): void => {
    this.assertIsOptionsInitialized(this.options);

    if (ruleViolation.level === RuleViolationLevel.WARNING) {
      this.warnings.push(ruleViolation);
      return;
    }

    this.errors.push(ruleViolation);
  };

  /**
   * Prints info about all of the rule violations recorded to the `stdout` and `stderr` streams:
   * - If there are rule violations recorded, returns sorted errors/warnings messages and their amount
   * - If no rule violations recorded, returns success message
   *
   * @returns object with `hasProblems` property representing whether there are any errors/warnings (true) or not (false)
   */
  public printProblems = (): { hasProblems: boolean } => {
    this.assertIsOptionsInitialized(this.options);

    const shouldShowErrors = Boolean(this.errors.length);
    const shouldShowWarnings =
      !this.options.quiet && Boolean(this.warnings.length);
    const totalProblems = this.errors.length + this.warnings.length;

    if (!shouldShowErrors && !shouldShowWarnings) {
      console.log(`\n${chalk.green("✅ All dependencies are valid")}\n`);
      return { hasProblems: false };
    }

    if (shouldShowErrors) {
      this.errors.forEach((error) => {
        console.error(String(error));
      });
    }

    if (shouldShowWarnings) {
      this.warnings.forEach((warning) => {
        console.warn(String(warning));
      });
    }

    console.error(
      `\n👮 ${chalk[shouldShowErrors ? "red" : "yellow"](
        `${totalProblems} problems (${this.errors.length} errors, ${this.warnings.length} warnings)`
      )}\n`
    );

    return { hasProblems: true };
  };
}

export const stats = new Stats();
