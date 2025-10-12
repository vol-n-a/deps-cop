/* eslint-disable no-magic-numbers */

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { AllowedRuleset } from "src/config/index.js";
import { Severity } from "src/config/index.js";

import { stats } from "../../../../stats/index.js";
import { checkAllowedRules } from "../check-allowed-rules.js";

const addRuleViolationSpy = vi.spyOn(stats, "addRuleViolation");

const dependenciesInstalled = new Map([
  ["someDependency", "1.0.0"],
  ["dependency", "2.0.0"],
]);

describe("checkAllowedRules", () => {
  beforeAll(() => {
    stats.init({ quiet: false });
  });

  afterEach(() => {
    addRuleViolationSpy.mockClear();
  });

  it("adds violation when installed version does not match allowed semver range", () => {
    const rules: AllowedRuleset = {
      dependency: ["^3.0.0", "reason"],
    };

    checkAllowedRules(dependenciesInstalled, rules, { quiet: false });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: Severity.ERROR })
    );
  });

  it("does not add violation when installed version matches allowed semver range", () => {
    const rules: AllowedRuleset = {
      dependency: ["2.x", "reason"],
    };

    checkAllowedRules(dependenciesInstalled, rules, { quiet: false });

    expect(addRuleViolationSpy).not.toHaveBeenCalled();
  });

  it("does not add violation when dependency is not installed", () => {
    const rules: AllowedRuleset = {
      otherDependency: ["^1.0.0", "reason"],
    };

    checkAllowedRules(dependenciesInstalled, rules, { quiet: false });

    expect(addRuleViolationSpy).not.toHaveBeenCalled();
  });

  it("handles multiple allowed rules for the same dependency", () => {
    const rules: AllowedRuleset = {
      someDependency: [
        ["^2.0.0", "reason 1"],
        [">=3.0.0", "reason 2"],
      ],
    };

    checkAllowedRules(dependenciesInstalled, rules, { quiet: false });

    const [[firstCallArg], [secondCallArg]] = addRuleViolationSpy.mock.calls;

    expect(addRuleViolationSpy).toHaveBeenCalledTimes(2);
    expect(firstCallArg.toString()).toContain("reason 1");
    expect(secondCallArg.toString()).toContain("reason 2");
  });

  it("throws error when invalid semver range is provided", () => {
    const rules: AllowedRuleset = {
      dependency: ["-1.2.-3", "reason"],
    };

    expect(() => {
      checkAllowedRules(dependenciesInstalled, rules, { quiet: false });
    }).toThrow(
      'Invalid semver range "-1.2.-3" in Allowed ruleset. Only valid semver ranges are allowed.'
    );
  });

  describe("rule severity override", () => {
    it("adds warning instead of error when severity option is warning and installed version does not match allowed semver range", () => {
      const rules: AllowedRuleset = {
        dependency: [">=3", "reason", { severity: Severity.WARNING }],
      };

      checkAllowedRules(dependenciesInstalled, rules, { quiet: false });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: Severity.WARNING })
      );
    });

    it("does not add warning when severity option is warning with quiet mode enabled", () => {
      const rules: AllowedRuleset = {
        dependency: [">=3", "reason", { severity: Severity.WARNING }],
      };

      checkAllowedRules(dependenciesInstalled, rules, { quiet: true });

      expect(addRuleViolationSpy).not.toHaveBeenCalled();
    });
  });
});
