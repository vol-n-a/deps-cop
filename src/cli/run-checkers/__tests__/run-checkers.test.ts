import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { readDepscopConfig } from "src/config/index.js";

import { stats } from "../../stats/index.js";
import * as checkers from "../checkers/index.js";
import { runCheckers } from "../run-checkers.js";
import {
  dependenciesInstalledMock,
  dependencyTreeMock,
} from "./mocks/index.js";

vi.mock(import("src/config/index.js"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    readDepscopConfig: vi.fn(),
  };
});

vi.mock("../checkers/index.js", () => ({
  checkAllowedRules: vi.fn(),
  checkForbiddenRules: vi.fn(),
  checkRecentRules: vi.fn(),
}));

vi.mock(import("../utils/index.js"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getDependenciesInstalled: vi.fn(() => dependenciesInstalledMock),
    getDependencyTree: vi.fn(() => Promise.resolve(dependencyTreeMock)),
  };
});

const readDepscopConfigMocked = vi.mocked(readDepscopConfig);

const checkAllowedRulesSpy = vi.spyOn(checkers, "checkAllowedRules");
const checkForbiddenRulesSpy = vi.spyOn(checkers, "checkForbiddenRules");
const checkRecentRulesSpy = vi.spyOn(checkers, "checkRecentRules");

describe("runCheckers", () => {
  beforeAll(() => {
    stats.init({ quiet: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("runs all checkers when all rulesets are present", async () => {
    readDepscopConfigMocked.mockResolvedValue({
      allowed: { someDependency: ["^1.0.0", "reason"] },
      forbidden: { dependency: ["any", "reason"] },
      recent: { someDependency: ["-1", "reason"] },
    });

    await runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: false,
    });

    expect(checkAllowedRulesSpy).toHaveBeenCalledTimes(1);
    expect(checkAllowedRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["^1.0.0", "reason"] },
      { quiet: false }
    );
    expect(checkForbiddenRulesSpy).toHaveBeenCalledTimes(1);
    expect(checkForbiddenRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { dependency: ["any", "reason"] },
      { quiet: false }
    );
    expect(checkRecentRulesSpy).toHaveBeenCalledTimes(1);
    expect(checkRecentRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["-1", "reason"] },
      { allowPrerelease: false, quiet: false }
    );
  });

  it("runs only allowed checker when only allowed ruleset is present", async () => {
    readDepscopConfigMocked.mockResolvedValue({
      allowed: { someDependency: ["^1.0.0", "reason"] },
    });

    await runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: false,
    });

    expect(checkAllowedRulesSpy).toHaveBeenCalledTimes(1);
    expect(checkAllowedRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["^1.0.0", "reason"] },
      { quiet: false }
    );
    expect(checkForbiddenRulesSpy).not.toHaveBeenCalled();
    expect(checkRecentRulesSpy).not.toHaveBeenCalled();
  });

  it("runs only forbidden checker when only forbidden ruleset is present", async () => {
    readDepscopConfigMocked.mockResolvedValue({
      forbidden: { dependency: ["any", "reason"] },
    });

    await runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: false,
    });

    expect(checkAllowedRulesSpy).not.toHaveBeenCalled();
    expect(checkForbiddenRulesSpy).toHaveBeenCalledTimes(1);
    expect(checkForbiddenRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { dependency: ["any", "reason"] },
      { quiet: false }
    );
    expect(checkRecentRulesSpy).not.toHaveBeenCalled();
  });

  it("runs only recent checker when only recent ruleset is present", async () => {
    readDepscopConfigMocked.mockResolvedValue({
      recent: { someDependency: ["-1", "reason"] },
    });

    await runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: false,
    });

    expect(checkAllowedRulesSpy).not.toHaveBeenCalled();
    expect(checkForbiddenRulesSpy).not.toHaveBeenCalled();
    expect(checkRecentRulesSpy).toHaveBeenCalledTimes(1);
    expect(checkRecentRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["-1", "reason"] },
      { allowPrerelease: false, quiet: false }
    );
  });

  it("passes quiet option to all checkers", async () => {
    readDepscopConfigMocked.mockResolvedValue({
      allowed: { someDependency: ["^1.0.0", "reason"] },
      forbidden: { dependency: ["any", "reason"] },
      recent: { someDependency: ["-1", "reason"] },
    });

    await runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: true,
    });

    expect(checkAllowedRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["^1.0.0", "reason"] },
      { quiet: true }
    );
    expect(checkForbiddenRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { dependency: ["any", "reason"] },
      { quiet: true }
    );
    expect(checkRecentRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["-1", "reason"] },
      { allowPrerelease: false, quiet: true }
    );
  });

  it("passes allowPrerelease option to recent checker", async () => {
    readDepscopConfigMocked.mockResolvedValue({
      allowed: { someDependency: ["^1.0.0", "reason"] },
      forbidden: { dependency: ["any", "reason"] },
      recent: { someDependency: ["-1", "reason"] },
    });

    await runCheckers({
      allowPrerelease: true,
      prod: false,
      quiet: false,
    });

    expect(checkRecentRulesSpy).toHaveBeenCalledWith(
      dependenciesInstalledMock,
      { someDependency: ["-1", "reason"] },
      { allowPrerelease: true, quiet: false }
    );
  });

  it("throws error when no rulesets provided", async () => {
    readDepscopConfigMocked.mockResolvedValue({});

    const promise = runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: false,
    });

    await expect(promise).rejects.toThrow(
      "No rulesets found in DepsCop configuration"
    );
  });

  it("exits with code 1 when violations are found after running checkers", async () => {
    vi.spyOn(stats, "printProblems").mockReturnValueOnce({ hasProblems: true });
    const processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementationOnce((number) => {
        throw new Error("process.exit: " + number);
      });

    readDepscopConfigMocked.mockResolvedValue({
      allowed: { someDependency: ["^1.0.0", "reason"] },
    });

    const promise = runCheckers({
      allowPrerelease: false,
      prod: false,
      quiet: false,
    });

    await expect(promise).rejects.toThrow("process.exit: 1");
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
