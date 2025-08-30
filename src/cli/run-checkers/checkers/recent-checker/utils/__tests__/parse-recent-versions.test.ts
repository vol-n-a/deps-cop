import { describe, expect, it } from "vitest";

import { parseRecentVersions } from "../parse-recent-versions.js";

describe("parseRecentVersions", () => {
  describe("Valid Semantic Versions", () => {
    it("parses basic versions", () => {
      expect(parseRecentVersions("0.0.4")).toEqual({
        recentMajors: 0,
        recentMinors: 0,
        recentPatches: 4,
      });
      expect(parseRecentVersions("1.2.3")).toEqual({
        recentMajors: 1,
        recentMinors: 2,
        recentPatches: 3,
      });
      expect(parseRecentVersions("10.20.30")).toEqual({
        recentMajors: 10,
        recentMinors: 20,
        recentPatches: 30,
      });
    });

    it("parses versions with prerelease", () => {
      expect(parseRecentVersions("1.0.0-alpha")).toEqual({
        recentMajors: 1,
        recentMinors: 0,
        recentPatches: 0,
      });
      expect(parseRecentVersions("1.0.0-beta")).toEqual({
        recentMajors: 1,
        recentMinors: 0,
        recentPatches: 0,
      });
    });

    it("parses versions with build metadata", () => {
      expect(parseRecentVersions("1.1.2+meta")).toEqual({
        recentMajors: 1,
        recentMinors: 1,
        recentPatches: 2,
      });
      expect(parseRecentVersions("2.0.0+build.1848")).toEqual({
        recentMajors: 2,
        recentMinors: 0,
        recentPatches: 0,
      });
      expect(parseRecentVersions("1.1.2-prerelease+meta")).toEqual({
        recentMajors: 1,
        recentMinors: 1,
        recentPatches: 2,
      });
    });

    it("parses complex prerelease versions", () => {
      expect(
        parseRecentVersions(
          "1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay"
        )
      ).toEqual({
        recentMajors: 1,
        recentMinors: 0,
        recentPatches: 0,
      });
      expect(
        parseRecentVersions("1.2.3----RC-SNAPSHOT.12.9.1--.12+788")
      ).toEqual({
        recentMajors: 1,
        recentMinors: 2,
        recentPatches: 3,
      });
    });

    it("parses edge case versions", () => {
      expect(
        parseRecentVersions("999999999999999.9999999999999.99999999999")
      ).toEqual({
        recentMajors: 999999999999999,
        recentMinors: 9999999999999,
        recentPatches: 99999999999,
      });
      expect(parseRecentVersions("1.0.0-0A.is.legal")).toEqual({
        recentMajors: 1,
        recentMinors: 0,
        recentPatches: 0,
      });
    });
  });

  describe("Valid Recent Versions", () => {
    it("parses single segment versions", () => {
      expect(parseRecentVersions("1")).toEqual({ recentMajors: 1 });
      expect(parseRecentVersions("-1")).toEqual({ recentMajors: -1 });
    });

    it("parses two segment versions", () => {
      expect(parseRecentVersions("1.2")).toEqual({
        recentMajors: 1,
        recentMinors: 2,
      });
      expect(parseRecentVersions("-1.2")).toEqual({
        recentMajors: -1,
        recentMinors: 2,
      });
      expect(parseRecentVersions("1.-2")).toEqual({
        recentMajors: 1,
        recentMinors: -2,
      });
      expect(parseRecentVersions("-1.-2")).toEqual({
        recentMajors: -1,
        recentMinors: -2,
      });
    });

    it("parses three segment versions", () => {
      expect(parseRecentVersions("1.2.-3")).toEqual({
        recentMajors: 1,
        recentMinors: 2,
        recentPatches: -3,
      });
      expect(parseRecentVersions("-1.2.3")).toEqual({
        recentMajors: -1,
        recentMinors: 2,
        recentPatches: 3,
      });
      expect(parseRecentVersions("-1.-2.3")).toEqual({
        recentMajors: -1,
        recentMinors: -2,
        recentPatches: 3,
      });
      expect(parseRecentVersions("-1.-2.-3")).toEqual({
        recentMajors: -1,
        recentMinors: -2,
        recentPatches: -3,
      });
    });

    it("parses recent versions with prerelease", () => {
      expect(parseRecentVersions("-1.0.3-gamma+b7718")).toEqual({
        recentMajors: -1,
        recentMinors: 0,
        recentPatches: 3,
      });
      expect(parseRecentVersions("-1.-2.-3-alpha")).toEqual({
        recentMajors: -1,
        recentMinors: -2,
        recentPatches: -3,
      });
      expect(parseRecentVersions("1.2-SNAPSHOT")).toEqual({
        recentMajors: 1,
        recentMinors: 2,
      });
      expect(parseRecentVersions("1.2-RC-SNAPSHOT")).toEqual({
        recentMajors: 1,
        recentMinors: 2,
      });
    });
  });

  describe("Invalid Semantic Versions", () => {
    it("rejects versions with leading zeros", () => {
      expect(parseRecentVersions("01.1.1")).toBeNull();
      expect(parseRecentVersions("1.01.1")).toBeNull();
      expect(parseRecentVersions("1.1.01")).toBeNull();
    });

    it("rejects versions with invalid prerelease format", () => {
      expect(parseRecentVersions("1.2.3-0123")).toBeNull();
      expect(parseRecentVersions("1.2.3-0123.0123")).toBeNull();
      expect(parseRecentVersions("1.0.0-alpha_beta")).toBeNull();
    });

    it("rejects versions with invalid build metadata", () => {
      expect(parseRecentVersions("1.1.2+.123")).toBeNull();
      expect(parseRecentVersions("9.8.7+meta+meta")).toBeNull();
    });

    it("rejects malformed version strings", () => {
      expect(parseRecentVersions("+invalid")).toBeNull();
      expect(parseRecentVersions("-invalid")).toBeNull();
      expect(parseRecentVersions("-invalid+invalid")).toBeNull();
      expect(parseRecentVersions("-invalid.01")).toBeNull();
    });

    it("rejects non-version strings", () => {
      expect(parseRecentVersions("alpha")).toBeNull();
      expect(parseRecentVersions("alpha.beta")).toBeNull();
      expect(parseRecentVersions("alpha.beta.1")).toBeNull();
      expect(parseRecentVersions("alpha+beta")).toBeNull();
      expect(parseRecentVersions("alpha_beta")).toBeNull();
    });

    it("rejects incomplete version strings", () => {
      expect(parseRecentVersions("alpha.")).toBeNull();
      expect(parseRecentVersions("alpha..")).toBeNull();
      expect(parseRecentVersions("1.0.0-alpha.")).toBeNull();
      expect(parseRecentVersions("1.0.0-alpha..")).toBeNull();
      expect(parseRecentVersions("1.0.0-alpha..1")).toBeNull();
    });

    it("rejects edge case invalid versions", () => {
      expect(parseRecentVersions("1.2.3.DEV")).toBeNull();
      expect(
        parseRecentVersions("1.2.31.2.3----RC-SNAPSHOT.12.09.1--..12+788")
      ).toBeNull();
      expect(parseRecentVersions("+justmeta")).toBeNull();
      expect(parseRecentVersions("9.8.7-whatever+meta+meta")).toBeNull();
    });
  });
});
