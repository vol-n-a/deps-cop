import type { ForegroundColor } from "chalk";
import chalk from "chalk";

import { Severity } from "../../utils/config/types.js";

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
  public severity: Severity;
  private checkName: string;
  private color: typeof ForegroundColor;
  private options?: RuleViolationOptions;

  constructor(
    checkName: string,
    private message: string,
    options?: RuleViolationOptions
  ) {
    this.checkName = checkName;
    this.severity = options?.severity ?? Severity.ERROR;
    this.color = mapLevelToColor[this.severity];

    if (options) {
      const {
        reason = options.reason ? chalk.italic(options.reason) : undefined,
        ...restOptions
      } = options;

      this.options = {
        reason,
        ...restOptions,
      };
    }
  }

  toString = (): string => {
    const stringBuilder = [`${this.checkName}: ${this.message}`];

    if (this.options?.description) {
      stringBuilder.push(this.options.description);
    }

    if (this.options?.reason) {
      stringBuilder.push(`Reason: ${this.options.reason}`);
    }

    return chalk[this.color](stringBuilder.join("\n\t"));
  };
}
