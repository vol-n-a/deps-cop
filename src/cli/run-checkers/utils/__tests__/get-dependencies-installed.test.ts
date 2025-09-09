import { describe, expect, it } from "vitest";

import { getDependenciesInstalled } from "../get-dependencies-installed.js";

describe("getDependenciesInstalled", () => {
  it("returns empty map when no deps", () => {
    const tree = {
      name: "a",
      version: "1.0.0",
      dependencies: undefined as any,
    };
    const result = getDependenciesInstalled(tree as any);
    expect(result.size).toBe(0);
  });

  it("collects direct dependencies into map", () => {
    const tree = {
      name: "a",
      version: "1.0.0",
      dependencies: {
        lodash: { version: "4.17.21" },
        react: { version: "18.2.0" },
      },
    };
    const result = getDependenciesInstalled(tree as any);
    expect(result.get("lodash")).toBe("4.17.21");
    expect(result.get("react")).toBe("18.2.0");
  });
});
