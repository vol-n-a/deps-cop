/* eslint-disable no-magic-numbers */

import { describe, expect, it } from "vitest";

import { resolveDepscopConfig } from "../resolve-depscop-config.js";

const validConfig = { a: 1 };
const nonObjectValues = [null, undefined, 123, "string", false, Symbol("sym")];

describe("resolveDepscopConfig", () => {
  it("passes through object", async () => {
    expect(await resolveDepscopConfig(validConfig)).toEqual(validConfig);
  });

  it("passes through function returning object", async () => {
    expect(await resolveDepscopConfig(() => validConfig)).toEqual(validConfig);
  });

  it("passes through promise-returning function resolving to object", async () => {
    expect(
      await resolveDepscopConfig(() => Promise.resolve(validConfig))
    ).toEqual(validConfig);
  });

  it("throws on non-object", async () => {
    for (const nonObjectValue of nonObjectValues) {
      await expect(resolveDepscopConfig(nonObjectValue)).rejects.toThrow(
        "DepsCop configuration must be a JavaScript object"
      );
    }
  });

  it("throws on function returning non-object", async () => {
    for (const nonObjectValue of nonObjectValues) {
      await expect(resolveDepscopConfig(() => nonObjectValue)).rejects.toThrow(
        "DepsCop configuration must be a JavaScript object"
      );
    }
  });

  it("throws on promise-returning function resolving to non-object", async () => {
    for (const nonObjectValue of nonObjectValues) {
      await expect(
        resolveDepscopConfig(() => Promise.resolve(nonObjectValue))
      ).rejects.toThrow("DepsCop configuration must be a JavaScript object");
    }
  });
});
