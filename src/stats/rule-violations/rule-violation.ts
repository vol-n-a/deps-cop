import type { ForegroundColor } from "chalk";
import chalk from "chalk";

export enum RuleViolationLevel {
  "ERROR" = "error",
  "WARNING" = "warning",
}

export type RuleViolationOptions = {
  description?: string;
  level?: RuleViolationLevel;
  reason?: string;
};

const mapLevelToColor: Record<RuleViolationLevel, typeof ForegroundColor> = {
  [RuleViolationLevel.ERROR]: "red",
  [RuleViolationLevel.WARNING]: "yellow",
};

export class RuleViolation {
  public level: RuleViolationLevel;
  private checkName: string;
  private color: typeof ForegroundColor;
  private options?: RuleViolationOptions;

  constructor(
    checkName: string,
    private message: string,
    options?: RuleViolationOptions
  ) {
    this.checkName = checkName;
    this.level = options?.level ?? RuleViolationLevel.ERROR;
    this.color = mapLevelToColor[this.level];

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
