import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Severity } from "src/config/index.js";

import { RuleViolation } from "../rule-violation.js";

describe("RuleViolation", () => {
  beforeAll(() => {
    vi.mock("chalk", () => ({
      default: {
        italic: vi.fn((text: unknown) => `<italic>${text}</italic>`),
        red: vi.fn((text: unknown) => `<red>${text}</red>`),
        yellow: vi.fn((text: unknown) => `<yellow>${text}</yellow>`),
      },
    }));
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("can be stringified", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage");

    expect(ruleViolation.toString()).toEqual(
      "<red>checkName: errorMessage</red>"
    );
  });

  it("is an error by default", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage");

    expect(ruleViolation.severity).toBe(Severity.ERROR);
  });

  it("colors the output red when severity is set to error", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage", {
      severity: Severity.ERROR,
    });

    expect(ruleViolation.toString()).toEqual(
      "<red>checkName: errorMessage</red>"
    );
    expect(ruleViolation.severity).toBe(Severity.ERROR);
  });

  it("colors the output yellow when severity is set to warning", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage", {
      severity: Severity.WARNING,
    });

    expect(ruleViolation.toString()).toEqual(
      "<yellow>checkName: errorMessage</yellow>"
    );
    expect(ruleViolation.severity).toBe(Severity.WARNING);
  });

  it("includes description and reason in the output", () => {
    const ruleViolation = new RuleViolation("checkName", "errorMessage", {
      description: "description",
      reason: "reason",
      severity: Severity.WARNING,
    });

    expect(ruleViolation.toString()).toEqual(
      "<yellow>checkName: errorMessage\n\tdescription\n\tReason: <italic>reason</italic></yellow>"
    );
  });
});
