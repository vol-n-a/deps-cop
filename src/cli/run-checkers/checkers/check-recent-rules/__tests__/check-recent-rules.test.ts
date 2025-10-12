/* eslint-disable no-magic-numbers */

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { RecentRuleset } from "src/config/index.js";
import { Severity } from "src/config/index.js";

import { stats } from "../../../../stats/index.js";
import { checkRecentRules } from "../check-recent-rules.js";
import { getPackageVersions } from "../utils/index.js";

vi.mock(import("../utils/index.js"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getPackageVersions: vi.fn(),
  };
});

const addRuleViolationSpy = vi.spyOn(stats, "addRuleViolation");
const getPackageVersionsMock = vi.mocked(getPackageVersions);

const dependenciesInstalled = new Map([
  ["someDependency", "1.0.0"],
  ["dependency", "2.0.0"],
  ["oldDependency", "1.0.0"],
]);

describe("checkRecentRules", () => {
  beforeAll(() => {
    stats.init({ quiet: false });
  });

  afterEach(() => {
    addRuleViolationSpy.mockClear();
    getPackageVersionsMock.mockClear();
  });

  it("adds error when version with newer najor segment is available", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["-1", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: Severity.ERROR,
      })
    );
  });

  it("adds error when version with newer minor segment is available", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["-1.-1", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "2.1.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: Severity.ERROR,
      })
    );
  });

  it("adds error when version with newer patch segment is available", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["-1.-1.-1", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "2.0.1"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: Severity.ERROR,
      })
    );
  });

  it("does not add violation when installed version satisfies recent version rule and is latest", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["-1", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).not.toHaveBeenCalled();
  });

  it("adds warning when installed version satisfies recent version rule but newer valid version is available", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["-2", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: Severity.WARNING,
      })
    );
  });

  it("does not add violation when dependency is not installed", async () => {
    const recentRules: RecentRuleset = {
      otherDependency: ["-1", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).not.toHaveBeenCalled();
  });

  it("adds error when no versions satisfy the recent version pattern", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["-1.2", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    expect(addRuleViolationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: Severity.ERROR,
      })
    );
  });

  it("handles multiple recent rules for the same dependency", async () => {
    const recentRules: RecentRuleset = {
      someDependency: [
        ["-1", "reason 1"],
        ["-2", "reason 2"],
      ],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

    await checkRecentRules(dependenciesInstalled, recentRules, {
      quiet: false,
      allowPrerelease: false,
    });

    const [[firstCallArg], [secondCallArg]] = addRuleViolationSpy.mock.calls;

    expect(addRuleViolationSpy).toHaveBeenCalledTimes(2);
    expect(firstCallArg.toString()).toContain("reason 1");
    expect(secondCallArg.toString()).toContain("reason 2");
  });

  it("throws error when semver range is provided", async () => {
    const recentRules: RecentRuleset = {
      dependency: ["2.x", "reason"],
    };
    getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

    await expect(
      checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: false,
        allowPrerelease: false,
      })
    ).rejects.toThrowError(
      'Semver ranges like "2.x" are not supported in Recent ruleset. Use Allowed ruleset ("allowed" field in depscop config) instead for semver range constraints.'
    );
  });

  describe("prerelease options handling", () => {
    it("filters out prerelease versions when prerelease option of a rule is not set", async () => {
      const recentRules: RecentRuleset = {
        dependency: ["-1", "reason"],
      };
      getPackageVersionsMock.mockResolvedValue([
        "1.0.0",
        "2.0.0",
        "3.0.0-alpha.1",
        "3.0.0-beta.1",
      ]);

      await checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: false,
        allowPrerelease: false,
      });

      expect(addRuleViolationSpy).not.toHaveBeenCalled();
    });

    it("includes prerelease versions when prerelease option of a rule is true", async () => {
      const recentRules: RecentRuleset = {
        dependency: ["-1", "reason", { prerelease: true }],
      };
      getPackageVersionsMock.mockResolvedValue([
        "1.0.0",
        "2.0.0",
        "3.0.0-alpha.1",
        "3.0.0-beta.1",
      ]);

      await checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: false,
        allowPrerelease: false,
      });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: Severity.ERROR,
        })
      );
    });

    it("includes prerelease versions when allowPrerelease option of a function is true", async () => {
      const recentRules: RecentRuleset = {
        dependency: ["-1", "reason"],
      };
      getPackageVersionsMock.mockResolvedValue([
        "1.0.0",
        "2.0.0",
        "3.0.0-alpha.1",
        "3.0.0-beta.1",
      ]);

      await checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: false,
        allowPrerelease: true,
      });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: Severity.ERROR,
        })
      );
    });
  });

  describe("rule severity override", () => {
    it("adds warning instead of error when severity option is warning", async () => {
      const recentRules: RecentRuleset = {
        dependency: ["-1", "reason", { severity: Severity.WARNING }],
      };
      getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

      await checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: false,
        allowPrerelease: false,
      });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: Severity.WARNING })
      );
    });

    it("adds warning instead of error when severity option is warning and no versions satisfy the recent version pattern", async () => {
      const recentRules: RecentRuleset = {
        dependency: ["-1.2", "reason", { severity: Severity.WARNING }],
      };
      getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

      await checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: false,
        allowPrerelease: false,
      });

      expect(addRuleViolationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: Severity.WARNING })
      );
    });

    it("does not add warning when installed version satisfies recent version rule but newer valid version is available and severity option is warning with quiet mode enabled", async () => {
      const recentRules: RecentRuleset = {
        dependency: ["-1", "reason", { severity: Severity.WARNING }],
      };
      getPackageVersionsMock.mockResolvedValue(["1.0.0", "2.0.0", "3.0.0"]);

      await checkRecentRules(dependenciesInstalled, recentRules, {
        quiet: true,
        allowPrerelease: false,
      });

      expect(addRuleViolationSpy).not.toHaveBeenCalled();
    });
  });
});
