/* eslint-disable no-magic-numbers */

import { describe, expect, it } from "vitest";

import { isNonNullable } from "../is-non-nullable.js";

describe("isNonNullable", () => {
  it("returns false for null", () => {
    expect(isNonNullable(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isNonNullable(undefined)).toBe(false);
  });

  it("returns true for all primitive values except null and undefined", () => {
    expect(isNonNullable(123)).toBe(true);
    expect(isNonNullable("string")).toBe(true);
    expect(isNonNullable(false)).toBe(true);
    expect(isNonNullable(Symbol())).toBe(true);
    expect(isNonNullable(BigInt("12345678901234567890"))).toBe(true);
  });

  it("returns true for objects", () => {
    expect(isNonNullable({})).toBe(true);
    expect(isNonNullable([])).toBe(true);
  });

  it("returns true for functions", () => {
    expect(isNonNullable(() => {})).toBe(true);
  });
});
