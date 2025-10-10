import { SemVer } from "semver";
import { describe, expect, it } from "vitest";

import { getRecentVersions } from "../get-recent-versions.js";

const versions = [
  new SemVer("1.1.0"),
  new SemVer("1.1.1"),
  new SemVer("1.2.0"),
  new SemVer("1.2.1"),
  new SemVer("1.2.2"),
  new SemVer("1.2.3"),
  new SemVer("1.2.4-beta.1"),
  new SemVer("1.2.4+build.5"),
  new SemVer("2.0.0"),
  new SemVer("2.0.1-alpha"),
  new SemVer("2.1.0"),
  new SemVer("2.1.1"),
  new SemVer("2.1.2-beta.2+exp.sha.5114f85"),
];

describe("getRecentVersions", () => {
  describe("major version selection", () => {
    it("picks latest major only", () => {
      const res = getRecentVersions(versions, "-1");

      expect(res.map((version) => version.raw)).toEqual([
        "2.0.0",
        "2.0.1-alpha",
        "2.1.0",
        "2.1.1",
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("picks last two majors", () => {
      const res = getRecentVersions(versions, "-2");

      expect(res.map((version) => version.raw)).toEqual([
        "1.1.0",
        "1.1.1",
        "1.2.0",
        "1.2.1",
        "1.2.2",
        "1.2.3",
        "1.2.4-beta.1",
        "1.2.4+build.5",
        "2.0.0",
        "2.0.1-alpha",
        "2.1.0",
        "2.1.1",
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("picks exact major", () => {
      const res = getRecentVersions(versions, "1");

      expect(res.map((version) => version.raw)).toEqual([
        "1.1.0",
        "1.1.1",
        "1.2.0",
        "1.2.1",
        "1.2.2",
        "1.2.3",
        "1.2.4-beta.1",
        "1.2.4+build.5",
      ]);
    });

    it("returns empty array when exact major is missing", () => {
      const res = getRecentVersions(versions, "3");

      expect(res).toEqual([]);
    });
  });

  describe("minor version selection", () => {
    it("picks latest minor within exact major", () => {
      const res = getRecentVersions(versions, "1.-1");

      expect(res.map((version) => version.raw)).toEqual([
        "1.2.0",
        "1.2.1",
        "1.2.2",
        "1.2.3",
        "1.2.4-beta.1",
        "1.2.4+build.5",
      ]);
    });

    it("picks last two minors within exact major", () => {
      const res = getRecentVersions(versions, "2.-2");

      expect(res.map((version) => version.raw)).toEqual([
        "2.0.0",
        "2.0.1-alpha",
        "2.1.0",
        "2.1.1",
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("picks latest minor within latest major", () => {
      const res = getRecentVersions(versions, "-1.-1");

      expect(res.map((version) => version.raw)).toEqual([
        "2.1.0",
        "2.1.1",
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("picks exact minor", () => {
      const res = getRecentVersions(versions, "2.1");

      expect(res.map((version) => version.raw)).toEqual([
        "2.1.0",
        "2.1.1",
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("returns empty array when exact minor is missing", () => {
      const res = getRecentVersions(versions, "2.3");

      expect(res).toEqual([]);
    });
  });

  describe("patch version selection", () => {
    it("picks latest patches within exact major and minor", () => {
      const res = getRecentVersions(versions, "1.2.-1");

      expect(res.map((version) => version.raw)).toEqual([
        "1.2.4-beta.1",
        "1.2.4+build.5",
      ]);
    });

    it("picks last two patches within exact major and minor", () => {
      const res = getRecentVersions(versions, "1.2.-2");

      expect(res.map((version) => version.raw)).toEqual([
        "1.2.3",
        "1.2.4-beta.1",
        "1.2.4+build.5",
      ]);
    });

    it("picks latest patches within exact major and latest minor", () => {
      const res = getRecentVersions(versions, "1.-1.-1");

      expect(res.map((version) => version.raw)).toEqual([
        "1.2.4-beta.1",
        "1.2.4+build.5",
      ]);
    });

    it("picks latest patches within latest major and exact minor", () => {
      const res = getRecentVersions(versions, "-1.1.-1");

      expect(res.map((version) => version.raw)).toEqual([
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("picks latest patches within latest major and minor", () => {
      const res = getRecentVersions(versions, "-1.-1.-1");

      expect(res.map((version) => version.raw)).toEqual([
        "2.1.2-beta.2+exp.sha.5114f85",
      ]);
    });

    it("picks exact patch within exact major and minor", () => {
      const res = getRecentVersions(versions, "1.2.1");

      expect(res.map((version) => version.raw)).toEqual(["1.2.1"]);
    });

    it("returns empty array when exact patch is missing", () => {
      const res = getRecentVersions(versions, "1.2.5");

      expect(res).toEqual([]);
    });
  });
});
