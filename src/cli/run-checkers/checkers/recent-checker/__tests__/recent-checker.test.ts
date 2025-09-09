import { beforeEach, describe, expect, it, vi } from "vitest";

import { Severity } from "src/config/index.js";

import { recentChecker } from "../recent-checker";

const addRuleViolation = vi.fn();
vi.mock("../../../../stats/index.js", () => ({
  stats: { addRuleViolation },
}));

const mockParseRecentVersions = vi.fn();
const mockGetPackageVersions = vi.fn();
const mockGetRecentVersions = vi.fn();
vi.mock("../utils/index.js", () => ({
  parseRecentVersions: mockParseRecentVersions,
  getPackageVersions: mockGetPackageVersions,
  getRecentVersions: mockGetRecentVersions,
}));

describe("recentChecker", () => {
  const cli = { quiet: false, prod: false, allowPrerelease: false } as any;
  const deps = new Map<string, string>([["pkg", "1.0.0"]]);

  beforeEach(() => {
    vi.clearAllMocks();
    mockParseRecentVersions.mockReturnValue(["major", 1]);
    mockGetPackageVersions.mockResolvedValue(["1.0.0", "1.1.0", "2.0.0"]);
    mockGetRecentVersions.mockReturnValue([
      { raw: "1.0.0", prerelease: [] },
      { raw: "1.1.0", prerelease: [] },
    ]);
  });

  it("skips when dependency not installed", async () => {
    await recentChecker(new Map(), { pkg: ["1", "r"] } as any, cli);
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("skips when rule is WARNING and quiet", async () => {
    await recentChecker(
      deps,
      { pkg: ["1", "r", { severity: Severity.WARNING }] } as any,
      { ...cli, quiet: true }
    );
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("skips when parseRecentVersions returns null", async () => {
    mockParseRecentVersions.mockReturnValue(null);
    await recentChecker(deps, { pkg: ["x", "r"] } as any, cli);
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("reports error when no allowed versions", async () => {
    mockGetRecentVersions.mockReturnValue([]);
    await recentChecker(deps, { pkg: ["1", "r"] } as any, cli);
    expect(addRuleViolation).toHaveBeenCalledTimes(1);
    expect(addRuleViolation.mock.calls[0][0].toString()).toContain(
      "No versions of pkg satisfy"
    );
  });

  it("skips when installed is latest allowed", async () => {
    mockGetRecentVersions.mockReturnValue([
      { raw: "0.9.0", prerelease: [] },
      { raw: "1.0.0", prerelease: [] },
    ]);
    await recentChecker(deps, { pkg: ["1", "r"] } as any, cli);
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("warns when installed allowed but not latest and not quiet", async () => {
    mockGetRecentVersions.mockReturnValue([
      { raw: "1.0.0", prerelease: [] },
      { raw: "1.1.0", prerelease: [] },
    ]);
    await recentChecker(deps, { pkg: ["1", "r"] } as any, {
      ...cli,
      quiet: false,
    });
    expect(addRuleViolation).toHaveBeenCalled();
    expect(addRuleViolation.mock.calls[0][0].toString()).toContain(
      "may be outdated soon"
    );
  });

  it("errors when installed not allowed", async () => {
    const deps2 = new Map<string, string>([["pkg", "0.8.0"]]);
    mockGetRecentVersions.mockReturnValue([
      { raw: "1.0.0", prerelease: [] },
    ] as any);
    await recentChecker(deps2, { pkg: ["1", "because"] } as any, cli);
    expect(addRuleViolation).toHaveBeenCalled();
    expect(addRuleViolation.mock.calls[0][0].toString()).toContain(
      "does not satisfy the recency version rule"
    );
    expect(addRuleViolation.mock.calls[0][0].toString()).toContain("because");
  });
});
