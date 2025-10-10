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
      expect(() => parseRecentVersions("01.1.1")).toThrowError(
        'Invalid recent version pattern: "01.1.1".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.01.1")).toThrowError(
        'Invalid recent version pattern: "1.01.1".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.1.01")).toThrowError(
        'Invalid recent version pattern: "1.1.01".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects versions with invalid prerelease format", () => {
      expect(() => parseRecentVersions("1.2.3-0123")).toThrowError(
        'Invalid recent version pattern: "1.2.3-0123".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.2.3-0123.0123")).toThrowError(
        'Invalid recent version pattern: "1.2.3-0123.0123".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.0.0-alpha_beta")).toThrowError(
        'Invalid recent version pattern: "1.0.0-alpha_beta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects versions with invalid build metadata", () => {
      expect(() => parseRecentVersions("1.1.2+.123")).toThrowError(
        'Invalid recent version pattern: "1.1.2+.123".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("9.8.7+meta+meta")).toThrowError(
        'Invalid recent version pattern: "9.8.7+meta+meta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects malformed version strings", () => {
      expect(() => parseRecentVersions("+invalid")).toThrowError(
        'Invalid recent version pattern: "+invalid".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("-invalid")).toThrowError(
        'Invalid recent version pattern: "-invalid".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("-invalid+invalid")).toThrowError(
        'Invalid recent version pattern: "-invalid+invalid".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("-invalid.01")).toThrowError(
        'Invalid recent version pattern: "-invalid.01".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects non-version strings", () => {
      expect(() => parseRecentVersions("alpha")).toThrowError(
        'Invalid recent version pattern: "alpha".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("alpha.beta")).toThrowError(
        'Invalid recent version pattern: "alpha.beta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("alpha.beta.1")).toThrowError(
        'Invalid recent version pattern: "alpha.beta.1".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("alpha+beta")).toThrowError(
        'Invalid recent version pattern: "alpha+beta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("alpha_beta")).toThrowError(
        'Invalid recent version pattern: "alpha_beta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects incomplete version strings", () => {
      expect(() => parseRecentVersions("alpha.")).toThrowError(
        'Invalid recent version pattern: "alpha.".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("alpha..")).toThrowError(
        'Invalid recent version pattern: "alpha..".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.0.0-alpha.")).toThrowError(
        'Invalid recent version pattern: "1.0.0-alpha.".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.0.0-alpha..")).toThrowError(
        'Invalid recent version pattern: "1.0.0-alpha..".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("1.0.0-alpha..1")).toThrowError(
        'Invalid recent version pattern: "1.0.0-alpha..1".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects edge case invalid versions", () => {
      expect(() => parseRecentVersions("1.2.3.DEV")).toThrowError(
        'Invalid recent version pattern: "1.2.3.DEV".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() =>
        parseRecentVersions("1.2.31.2.3----RC-SNAPSHOT.12.09.1--..12+788")
      ).toThrowError(
        'Invalid recent version pattern: "1.2.31.2.3----RC-SNAPSHOT.12.09.1--..12+788".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() => parseRecentVersions("+justmeta")).toThrowError(
        'Invalid recent version pattern: "+justmeta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
      expect(() =>
        parseRecentVersions("9.8.7-whatever+meta+meta")
      ).toThrowError(
        'Invalid recent version pattern: "9.8.7-whatever+meta+meta".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.'
      );
    });

    it("rejects empty string", () => {
      expect(() => parseRecentVersions("")).toThrowError(
        "Empty string is not allowed as a recent version pattern.\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern."
      );
    });
  });
});
