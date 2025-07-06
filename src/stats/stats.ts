import chalk from "chalk";

import type { CliOptions } from "../command.js";
import { Severity } from "../utils/config/types.js";
import type { RuleViolation } from "./rule-violations/rule-violation.js";

class Stats {
  private errors: Array<RuleViolation> = [];
  private warnings: Array<RuleViolation> = [];
  private cliOptions: CliOptions | null = null;

  public init(cliOptions: CliOptions) {
    this.cliOptions = cliOptions;
  }

  /**
   * Asserts whether `cliOptions` is initialized or not
   *
   * @param cliOptions
   *
   * @throws if `cliOptions === null`
   */
  private assertIsOptionsInitialized: (
    cliOptions: CliOptions | null
  ) => asserts cliOptions is CliOptions = (cliOptions) => {
    if (cliOptions === null) {
      throw new Error(
        "Stats instance is not initialized. Call stats.init(cliOptions) before using this object"
      );
    }
  };

  /**
   * Records rule violation to stats' storage
   */
  public addRuleViolation = (ruleViolation: RuleViolation): void => {
    this.assertIsOptionsInitialized(this.cliOptions);

    if (ruleViolation.severity === Severity.WARNING) {
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
    this.assertIsOptionsInitialized(this.cliOptions);

    const shouldShowErrors = Boolean(this.errors.length);
    const shouldShowWarnings =
      !this.cliOptions.quiet && Boolean(this.warnings.length);
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
