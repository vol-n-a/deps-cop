/* eslint-disable no-magic-numbers */

import { describe, expect, it } from "vitest";

import { resolveDepscopConfig } from "../resolve-depscop-config.js";

describe("resolveDepscopConfig", () => {
  it("passes through object", async () => {
    expect(await resolveDepscopConfig({ a: 1 })).toEqual({ a: 1 });
  });

  it("throws on non-object", async () => {
    await expect(resolveDepscopConfig(null)).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(resolveDepscopConfig(undefined)).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(resolveDepscopConfig(123)).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(resolveDepscopConfig("string")).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(resolveDepscopConfig(false)).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(resolveDepscopConfig(Symbol("sym"))).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(resolveDepscopConfig(() => ({ a: 1 }))).rejects.toThrow(
      "DepsCop configuration must be a JavaScript object"
    );
    await expect(
      resolveDepscopConfig(() => Promise.resolve({ a: 1 }))
    ).rejects.toThrow("DepsCop configuration must be a JavaScript object");
  });
});
