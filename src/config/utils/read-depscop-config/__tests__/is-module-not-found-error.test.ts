/* eslint-disable no-magic-numbers */

import { describe, expect, it } from "vitest";

import { isModuleNotFoundError } from "../is-module-not-found-error.js";

describe("isModuleNotFoundError", () => {
  it("returns true for ENOENT error code", () => {
    const enoentError = Object.assign(new Error("x"), { code: "ENOENT" });
    expect(isModuleNotFoundError(enoentError)).toBe(true);
  });

  it("returns true for ERR_MODULE_NOT_FOUND error code", () => {
    const errModuleNotFoundError = Object.assign(new Error("x"), {
      code: "ERR_MODULE_NOT_FOUND",
    });
    expect(isModuleNotFoundError(errModuleNotFoundError)).toBe(true);
  });

  it("returns false for errors without a code", () => {
    const defaultError = new Error("x");
    expect(isModuleNotFoundError(defaultError)).toBe(false);
  });

  it("returns false for errors with other codes", () => {
    const otherCodeError = Object.assign(new Error("x"), { code: "OTHER" });
    expect(isModuleNotFoundError(otherCodeError)).toBe(false);
  });

  it("returns false for non-error values", () => {
    expect(isModuleNotFoundError({})).toBe(false);
    expect(isModuleNotFoundError(null)).toBe(false);
    expect(isModuleNotFoundError(undefined)).toBe(false);
    expect(isModuleNotFoundError(123)).toBe(false);
    expect(isModuleNotFoundError("string")).toBe(false);
    expect(isModuleNotFoundError(true)).toBe(false);
    expect(isModuleNotFoundError(Symbol("sym"))).toBe(false);
  });
});
