import { describe, expect, it, vi } from "vitest";

import { Severity } from "src/config/index.js";

import { semverChecker } from "../semver-checker.js";

const addRuleViolation = vi.fn();
vi.mock("../../../../stats/index.js", () => ({
  stats: { addRuleViolation },
}));

describe("semverChecker", () => {
  const cli = { quiet: false, prod: false } as any;
  const deps = new Map<string, string>([["pkg", "1.2.3"]]);

  it("skips when dependency not installed", () => {
    semverChecker(new Map(), { pkg: [">=1", ""] } as any, cli);
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("skips when version satisfies range", () => {
    semverChecker(deps, { pkg: ["^1.0.0", ""] } as any, cli);
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("adds violation when not satisfying range", () => {
    semverChecker(deps, { pkg: [">=2.0.0", "because"] } as any, cli);
    expect(addRuleViolation).toHaveBeenCalled();
    expect(addRuleViolation.mock.calls[0][0].toString()).toContain(
      "does not satisfy pkg@>=2.0.0"
    );
  });

  it("skips WARNING when quiet", () => {
    semverChecker(
      deps,
      { pkg: [">=2", "", { severity: Severity.WARNING }] } as any,
      { quiet: true, prod: false } as any
    );
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("handles array of rules", () => {
    semverChecker(
      deps,
      {
        pkg: [
          [">=2", ""],
          ["^1", "because"],
        ],
      } as any,
      cli
    );
    expect(addRuleViolation).toHaveBeenCalledTimes(1);
  });
});
