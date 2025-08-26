import type { ForegroundColor } from "chalk";
import chalk from "chalk";

import { Severity } from "src/config/index.js";

export type RuleViolationOptions = {
  description?: string;
  severity?: Severity;
  reason?: string;
};

const mapLevelToColor: Record<Severity, typeof ForegroundColor> = {
  [Severity.ERROR]: "red",
  [Severity.WARNING]: "yellow",
};

export class RuleViolation {
  #checkName: string;
  #description?: string;
  #message: string;
  #reason?: string;
  #severity: Severity;

  constructor(
    checkName: string,
    message: string,
    options?: RuleViolationOptions
  ) {
    this.#checkName = checkName;
    this.#description = options?.description;
    this.#message = message;
    this.#reason = options?.reason;
    this.#severity = options?.severity ?? Severity.ERROR;
  }

  get severity(): Severity {
    return this.#severity;
  }

  toString = (): string => {
    const stringBuilder = [`${this.#checkName}: ${this.#message}`];

    if (this.#description) {
      stringBuilder.push(this.#description);
    }

    if (this.#reason) {
      stringBuilder.push(`Reason: ${chalk.italic(this.#reason)}`);
    }

    return chalk[mapLevelToColor[this.#severity]](stringBuilder.join("\n\t"));
  };
}
