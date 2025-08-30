/* eslint-disable no-magic-numbers */

import { describe, expect, it } from "vitest";

import { isArrayOfArrays } from "../is-array-of-arrays.js";

describe("isArrayOfArrays", () => {
  it("detects array of arrays", () => {
    expect(isArrayOfArrays([])).toBe(true);
    expect(isArrayOfArrays([[], []])).toBe(true);
    expect(isArrayOfArrays([[1], [2]])).toBe(true);
  });

  it("rejects non array or mixed arrays", () => {
    expect(isArrayOfArrays(null)).toBe(false);
    expect(isArrayOfArrays(undefined)).toBe(false);
    expect(isArrayOfArrays(123)).toBe(false);
    expect(isArrayOfArrays("string")).toBe(false);
    expect(isArrayOfArrays({})).toBe(false);
    expect(isArrayOfArrays([1, [2]])).toBe(false);
    expect(isArrayOfArrays([[], 2])).toBe(false);
    expect(isArrayOfArrays([[], {}])).toBe(false);
    expect(isArrayOfArrays([[], "foo"])).toBe(false);
    expect(isArrayOfArrays([[], null])).toBe(false);
    expect(isArrayOfArrays([[], undefined])).toBe(false);
    expect(isArrayOfArrays([[1], "a", [{}], [true]])).toBe(false);
  });

  it("handles arrays with different element types", () => {
    expect(isArrayOfArrays([[[1]], [["2"]]])).toBe(true);
    expect(isArrayOfArrays([[undefined], [null]])).toBe(true);
    expect(isArrayOfArrays([[1], ["a"], [{}], [true]])).toBe(true);
  });
});
