import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Severity } from "src/config/index.js";

import { RuleViolation } from "../rule-violation.js";

describe("RuleViolation", () => {
  beforeAll(() => {
    vi.mock("chalk", () => ({
      default: {
        italic: vi.fn((text: unknown) => `italic: ${text}`),
        red: vi.fn((text: unknown) => `red: ${text}`),
        yellow: vi.fn((text: unknown) => `yellow: ${text}`),
      },
    }));
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("can be stringified", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage");

    expect(ruleViolation.toString()).toEqual("red: checkName: errorMessage");
  });

  it("is an error by default", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage");

    expect(ruleViolation.severity).toBe(Severity.ERROR);
  });

  it("colors the output red when severity is set to error", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage", {
      severity: Severity.ERROR,
    });

    expect(ruleViolation.toString()).toEqual("red: checkName: errorMessage");
    expect(ruleViolation.severity).toBe(Severity.ERROR);
  });

  it("colors the output yellow when severity is set to warning", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage", {
      severity: Severity.WARNING,
    });

    expect(ruleViolation.toString()).toEqual("yellow: checkName: errorMessage");
    expect(ruleViolation.severity).toBe(Severity.WARNING);
  });

  it("includes description and reason in the output", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage", {
      description: "description",
      reason: "reason",
      severity: Severity.WARNING,
    });

    expect(ruleViolation.toString()).toEqual(
      "yellow: checkName: errorMessage\n\tdescription\n\tReason: italic: reason"
    );
  });
});
