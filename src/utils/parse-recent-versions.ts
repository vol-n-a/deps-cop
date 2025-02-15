// TODO: Support * along with numbers (?)
const recentRegex = /^(-?\d+)(?:\.(-?\d+))?(?:\.(-?\d+))?$/;

const parseInt = (value: string): number | undefined => {
  const res = Number.parseInt(value);

  if (isNaN(res)) {
    return undefined;
  }

  return res;
};

export type RecentVersions = {
  recentMajors: number;
  recentMinors?: number;
  recentPatches?: number;
};

/**
 * Parses a "recent version pattern" string into a set of numbers, representing major, minor, and patch versions
 *
 * This function takes a version string in the format `(major)(.minor)?(.patch)?(-prerelease)?`, where each segment represents
 * a version number (e.g., `1.2.3`). It splits the string by periods (`.`) and converts each segment
 * into a corresponding number (including support for negative numbers). The prerelease part of the version
 * (e.g., -alpha, -beta, etc.) is ignored, and only the numerical segments are parsed.
 * The result is an object containing the `recentMajors`, `recentMinors` and `recentPatches` version numbers
 *
 * @example
 * parseRecentVersions("-1.-2.-3") // Output: { recentMajors: -1, recentMinors: -2, recentPatches: -3 }
 *
 * @example
 * parseRecentVersions("1.-2.3") // Output: { recentMajors: 1, recentMinors: -2, recentPatches: 3 }
 *
 * @example
 * // The prerelease part "-alpha" is ignored, returning only the numeric parts
 * parseRecentVersions("1.2.3-alpha") // Output: { recentMajors: 1, recentMinors: 2, recentPatches: 3 }
 *
 * @example
 * // The string does not match the expected "recent version pattern", so null is returned
 * parseRecentVersions("invalid-version") // Output: null
 *
 * @param value The "recent version pattern" string in the format `(major)(.minor)?(.patch)?(-prerelease)?`
 * @returns An object containing the `recentMajors`, `recentMinors` and `recentPatches` version numbers, or null if `value` does not match the expected "recent version pattern"
 */
export const parseRecentVersions = (value: string): RecentVersions | null => {
  const res = value.match(recentRegex);

  if (!res) {
    return null;
  }

  const [, recentMajorsRaw, recentMinorsRaw, recentPatchesRaw] = res;
  const [recentMajors, recentMinors, recentPatches] = [
    parseInt(recentMajorsRaw),
    parseInt(recentMinorsRaw),
    parseInt(recentPatchesRaw),
  ];

  // If the major version is undefined, then minor and patch versions are also undefined (according to recentRegex)
  if (recentMajors === undefined) {
    return null;
  }

  return { recentMajors, recentMinors, recentPatches };
};
