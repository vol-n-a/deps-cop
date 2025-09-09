import { beforeEach, describe, expect, it, vi } from "vitest";

import { Severity } from "src/config/index.js";

import { forbiddenChecker } from "../forbidden-checker";

const addRuleViolation = vi.fn();
vi.mock("../../../../stats/index.js", () => ({
  stats: { addRuleViolation },
}));

describe("forbiddenChecker", () => {
  const cliOptions = { quiet: false, prod: false } as const;
  let deps: Map<string, string>;

  beforeEach(() => {
    deps = new Map([
      ["leftpad", "1.0.0"],
      ["ms", "2.0.0"],
    ]);
    addRuleViolation.mockReset();
  });

  it("skips when dependency not installed", () => {
    forbiddenChecker(
      deps,
      { lodash: ["any", "nope"] } as any,
      cliOptions as any
    );
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("reports when version is 'any'", () => {
    forbiddenChecker(
      deps,
      { leftpad: ["any", "bad"] } as any,
      cliOptions as any
    );
    expect(addRuleViolation).toHaveBeenCalled();
  });

  it("reports when installed version satisfies forbidden range", () => {
    forbiddenChecker(deps, { ms: ["2.x", "reason"] } as any, cliOptions as any);
    expect(addRuleViolation).toHaveBeenCalled();
  });

  it("skips when installed version does not satisfy forbidden range", () => {
    forbiddenChecker(
      deps,
      { ms: ["^3.0.0", "reason"] } as any,
      cliOptions as any
    );
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("skips warning when quiet", () => {
    forbiddenChecker(
      deps,
      { ms: ["any", "reason", { severity: Severity.WARNING }] } as any,
      { quiet: true, prod: false } as any
    );
    expect(addRuleViolation).not.toHaveBeenCalled();
  });

  it("handles array of rules", () => {
    forbiddenChecker(
      deps,
      {
        leftpad: [
          ["1.x", "desc"],
          ["any", "desc2"],
        ],
      } as any,
      cliOptions as any
    );
    expect(addRuleViolation).toHaveBeenCalledTimes(2);
  });
});
