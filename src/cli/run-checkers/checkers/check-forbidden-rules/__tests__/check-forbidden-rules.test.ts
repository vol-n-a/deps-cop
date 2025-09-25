/* eslint-disable no-magic-numbers */

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { ForbiddenRuleset } from "src/config/index.js";
import { Severity } from "src/config/index.js";

import { stats } from "../../../../stats/index.js";
import { checkForbiddenRules } from "../check-forbidden-rules.js";

const addRuleViolationSpy = vi.spyOn(stats, "addRuleViolation");

const dependenciesInstalled = new Map([
  ["someDependency", "1.0.0"],
  ["dependency", "2.0.0"],
]);

describe("checkForbiddenRules", () => {
  beforeAll(() => {
    stats.init({ quiet: false });
  });

  afterEach(() => {
    addRuleViolationSpy.mockClear();
  });

  it("adds violation when forbidden version is 'any'", () => {
    const forbiddenRules: ForbiddenRuleset = {
      someDependency: ["any", "reason"],
    };

    checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
      quiet: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: Severity.ERROR })
    );
  });

  it("adds violation when installed version matches forbidden semver range", () => {
    const forbiddenRules: ForbiddenRuleset = {
      dependency: ["2.x", "reason"],
    };

    checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
      quiet: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: Severity.ERROR })
    );
  });

  it("does not add violation when installed version does not match forbidden semver range", () => {
    const forbiddenRules: ForbiddenRuleset = {
      dependency: ["^3.0.0", "reason"],
    };

    checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
      quiet: false,
    });

    expect(addRuleViolationSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ severity: Severity.ERROR })
    );
  });

  it("does not add violation when forbidden dependency is not installed", () => {
    const forbiddenRules: ForbiddenRuleset = {
      otherDependency: ["any", "reason"],
    };

    checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
      quiet: false,
    });

    expect(addRuleViolationSpy).not.toHaveBeenCalled();
  });

  it("handles multiple forbidden rules for the same dependency", () => {
    const forbiddenRules: ForbiddenRuleset = {
      someDependency: [
        ["1.x", "reason 1"],
        ["any", "reason 2"],
      ],
    };

    checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
      quiet: false,
    });

    const [[firstCallArg], [secondCallArg]] = addRuleViolationSpy.mock.calls;

    expect(addRuleViolationSpy).toHaveBeenCalledTimes(2);
    expect(firstCallArg.toString()).toContain("reason 1");
    expect(secondCallArg.toString()).toContain("reason 2");
  });

  describe("rule severity override", () => {
    it("adds warning instead of error when severity option is warning and forbidden version is 'any'", () => {
      const forbiddenRules: ForbiddenRuleset = {
        dependency: ["any", "reason", { severity: Severity.WARNING }],
      };

      checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
        quiet: false,
      });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: Severity.WARNING })
      );
    });

    it("adds warning instead of error when severity option is warning and installed version matches forbidden semver range", () => {
      const forbiddenRules: ForbiddenRuleset = {
        dependency: ["2", "reason", { severity: Severity.WARNING }],
      };

      checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
        quiet: false,
      });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: Severity.WARNING })
      );
    });

    it("does not add warning when severity option is warning with quiet mode enabled", () => {
      const forbiddenRules: ForbiddenRuleset = {
        dependency: ["any", "reason", { severity: Severity.WARNING }],
      };

      checkForbiddenRules(dependenciesInstalled, forbiddenRules, {
        quiet: true,
      });

      expect(addRuleViolationSpy).not.toHaveBeenCalled();
    });
  });
});
