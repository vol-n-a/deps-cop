import chalk from "chalk";

import { Severity } from "../../config/index.js";
import type { CliOptions } from "../model/index.js";
import type { RuleViolation } from "./rule-violations/rule-violation.js";

class Stats {
  #cliOptions: CliOptions | null = null;
  #errors: Array<RuleViolation> = [];
  #warnings: Array<RuleViolation> = [];

  init(cliOptions: CliOptions) {
    this.#cliOptions = cliOptions;
  }

  /**
   * Asserts whether `cliOptions` is initialized or not
   *
   * @param cliOptions
   *
   * @throws if `cliOptions === null`
   */
  #assertIsOptionsInitialized: (
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
  addRuleViolation = (ruleViolation: RuleViolation): void => {
    this.#assertIsOptionsInitialized(this.#cliOptions);

    if (ruleViolation.severity === Severity.WARNING) {
      this.#warnings.push(ruleViolation);
      return;
    }

    this.#errors.push(ruleViolation);
  };

  /**
   * Prints info about all of the rule violations recorded to the `stdout` and `stderr` streams:
   * - If there are rule violations recorded, returns sorted errors/warnings messages and their amount
   * - If no rule violations recorded, returns success message
   *
   * @returns object with `hasProblems` property representing whether there are any errors/warnings (true) or not (false)
   */
  printProblems = (): { hasProblems: boolean } => {
    this.#assertIsOptionsInitialized(this.#cliOptions);

    const shouldShowErrors = Boolean(this.#errors.length);
    const shouldShowWarnings =
      !this.#cliOptions.quiet && Boolean(this.#warnings.length);
    const totalProblems = this.#errors.length + this.#warnings.length;

    if (!shouldShowErrors && !shouldShowWarnings) {
      console.log(`\n${chalk.green("✅ All dependencies are valid")}\n`);
      return { hasProblems: false };
    }

    if (shouldShowErrors) {
      this.#errors.forEach((error) => {
        console.error(String(error));
      });
    }

    if (shouldShowWarnings) {
      this.#warnings.forEach((warning) => {
        console.warn(String(warning));
      });
    }

    console.error(
      `\n👮 ${chalk[shouldShowErrors ? "red" : "yellow"](
        `${totalProblems} problems (${this.#errors.length} errors, ${this.#warnings.length} warnings)`
      )}\n`
    );

    return { hasProblems: true };
  };
}

export const stats = new Stats();
