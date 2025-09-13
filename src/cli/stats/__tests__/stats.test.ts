import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { Severity } from "src/config/index.js";

import { RuleViolation } from "../model/index.js";
import { Stats } from "../stats.js";

vi.mock("chalk", () => ({
  default: {
    green: vi.fn((text: unknown) => `<green>${text}</green>`),
    italic: vi.fn((text: unknown) => `<italic>${text}</italic>`),
    red: vi.fn((text: unknown) => `<red>${text}</red>`),
    yellow: vi.fn((text: unknown) => `<yellow>${text}</yellow>`),
  },
}));

const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("Stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("prints success when no problems", () => {
    const stats = new Stats();
    stats.init({
      quiet: false,
    });

    const res = stats.printProblems();

    expect(res.hasProblems).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\n<green>✅ All dependencies are valid</green>\n"
    );
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("records warnings and prints them", () => {
    const stats = new Stats();
    stats.init({
      quiet: false,
    });

    stats.addRuleViolation(
      new RuleViolation("test-check", "warn", {
        severity: Severity.WARNING,
        reason: "reason",
      })
    );
    const res = stats.printProblems();

    expect(res.hasProblems).toBe(true);
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "<yellow>test-check: warn\n\tReason: <italic>reason</italic></yellow>"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "\n👮 <yellow>1 problems (0 errors, 1 warnings)</yellow>\n"
    );
  });

  it("records errors and prints them", () => {
    const stats = new Stats();
    stats.init({
      quiet: false,
    });

    stats.addRuleViolation(
      new RuleViolation("test-check", "err", {
        severity: Severity.ERROR,
        reason: "reason",
      })
    );
    const res = stats.printProblems();

    expect(res.hasProblems).toBe(true);
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "<red>test-check: err\n\tReason: <italic>reason</italic></red>"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "\n👮 <red>1 problems (1 errors, 0 warnings)</red>\n"
    );
  });

  it("records errors and warnings and prints them", () => {
    const stats = new Stats();
    stats.init({
      quiet: false,
    });

    stats.addRuleViolation(
      new RuleViolation("test-check", "err", {
        severity: Severity.ERROR,
        reason: "reason",
      })
    );
    stats.addRuleViolation(
      new RuleViolation("test-check", "warn1", {
        severity: Severity.WARNING,
        reason: "reason",
      })
    );
    const res = stats.printProblems();

    expect(res.hasProblems).toBe(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "<yellow>test-check: warn1\n\tReason: <italic>reason</italic></yellow>"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "<red>test-check: err\n\tReason: <italic>reason</italic></red>"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "\n👮 <red>2 problems (1 errors, 1 warnings)</red>\n"
    );
  });

  it("ignores warnings and prints success with quiet option enabled", () => {
    const stats = new Stats();
    stats.init({
      quiet: true,
    });

    stats.addRuleViolation(
      new RuleViolation("test-check", "warn", {
        severity: Severity.WARNING,
        reason: "reason",
      })
    );
    const res = stats.printProblems();

    expect(res.hasProblems).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\n<green>✅ All dependencies are valid</green>\n"
    );
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("ignores warnings, records errors and prints them with quiet option enabled", () => {
    const stats = new Stats();
    stats.init({
      quiet: true,
    });

    stats.addRuleViolation(
      new RuleViolation("test-check", "warn", {
        severity: Severity.WARNING,
        reason: "reason",
      })
    );
    stats.addRuleViolation(
      new RuleViolation("test-check", "err", {
        severity: Severity.ERROR,
        reason: "reason",
      })
    );
    const res = stats.printProblems();

    expect(res.hasProblems).toBe(true);
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "<red>test-check: err\n\tReason: <italic>reason</italic></red>"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "\n👮 <red>1 problems (1 errors, 0 warnings)</red>\n"
    );
  });

  it("throws error if stats is not initialized", () => {
    const stats = new Stats();

    expect(() => {
      stats.printProblems();
    }).toThrowError(
      "Stats instance is not initialized. Call stats.init(options) before using this object"
    );
    expect(() => {
      stats.addRuleViolation(
        new RuleViolation("test-check", "err", {
          severity: Severity.ERROR,
          reason: "reason",
        })
      );
    }).toThrowError(
      "Stats instance is not initialized. Call stats.init(options) before using this object"
    );
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
