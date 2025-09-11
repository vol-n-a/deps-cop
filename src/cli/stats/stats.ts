import chalk from "chalk";

import { Severity } from "src/config/index.js";

import type { RuleViolation } from "./model/index.js";
import type { Options } from "./model/types.js";

class Stats {
  #options: Options | null = null;
  #errors: Array<RuleViolation> = [];
  #warnings: Array<RuleViolation> = [];

  init(options: Options): void {
    this.#options = options;
  }

  /**
   * Asserts whether `#options` field is initialized or not
   *
   * @param options The options object to check the existence of
   *
   * @throws {Error} if `options === null`
   */
  #assertIsOptionsInitialized: (
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
  addRuleViolation = (ruleViolation: RuleViolation): void => {
    this.#assertIsOptionsInitialized(this.#options);

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
    this.#assertIsOptionsInitialized(this.#options);

    const shouldShowErrors = Boolean(this.#errors.length);
    const shouldShowWarnings =
      !this.#options.quiet && Boolean(this.#warnings.length);
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
