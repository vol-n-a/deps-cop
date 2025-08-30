/* eslint-disable no-magic-numbers */

import { describe, expect, it } from "vitest";

import { isPromiseLike } from "../is-promise-like.js";

describe("isPromiseLike", () => {
  it("returns true for thenables", () => {
    const thenable = { then: () => {} };
    expect(isPromiseLike(thenable)).toBe(true);
  });

  it("returns true for Promises", () => {
    const promise = Promise.resolve(1);
    expect(isPromiseLike(promise)).toBe(true);
  });

  it("returns false for non-thenables", () => {
    expect(isPromiseLike(null)).toBe(false);
    expect(isPromiseLike(undefined)).toBe(false);
    expect(isPromiseLike(123)).toBe(false);
    expect(isPromiseLike("x")).toBe(false);
    expect(isPromiseLike({})).toBe(false);
    expect(isPromiseLike({ then: 123 })).toBe(false);
  });
});
