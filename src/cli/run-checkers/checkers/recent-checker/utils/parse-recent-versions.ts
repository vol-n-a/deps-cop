// The recent version pattern uses a custom regular expression that extends the standard
// semver format to allow negative numbers in version segments. The minor and patch segments are optional.
// - You can see the regex here: https://regex101.com/r/lweqjQ/1
// - It is based on the official semver regex: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const recentRegex =
  /^(-?(?:0|[1-9]\d*))(?:\.(-?(?:0|[1-9]\d*)))?(?:\.(-?(?:0|[1-9]\d*)))?(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Converts a string into an integer, or returns `undefined` if the string is not a valid integer.
 *
 * @param value - The string to parse as an integer.
 * @returns The parsed integer, or `undefined` if parsing fails.
 */
const parseIntOrUndefined = (value: string): number | undefined => {
  const res = Number.parseInt(value);

  if (isNaN(res)) {
    return undefined;
  }

  return res;
};

export type RecentVersionSegments = {
  recentMajors: number;
  recentMinors?: number;
  recentPatches?: number;
};

/**
 * Parses a "recent version pattern" string into an object with numbers representing major, minor, and patch versions
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
 * // The string does not match the expected "recent version pattern", so an error is thrown
 * parseRecentVersions("invalid-version") // Throws Error
 *
 * @param value The "recent version pattern" string in the format `(major)(.minor)?(.patch)?(-prerelease)?`
 * @returns An object containing the `recentMajors`, `recentMinors` and `recentPatches` version numbers, or null if `value` does not match the expected "recent version pattern"
 */
export const parseRecentVersions = (value: string): RecentVersionSegments => {
  if (value === "") {
    throw new Error(
      "Empty string is not allowed as a recent version pattern.\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern."
    );
  }

  const res = value.match(recentRegex);

  if (!res) {
    throw new Error(
      `Invalid recent version pattern: "${value}".\nSee https://regex101.com/r/lweqjQ/1 for more info about the accepted pattern.`
    );
  }

  const [, recentMajorsRaw, recentMinorsRaw, recentPatchesRaw] = res;
  const [recentMajors, recentMinors, recentPatches] = [
    // The major version segment is always defined because recentRegex requires the first numeric version segment to be present.
    Number.parseInt(recentMajorsRaw),
    parseIntOrUndefined(recentMinorsRaw),
    parseIntOrUndefined(recentPatchesRaw),
  ];

  return { recentMajors, recentMinors, recentPatches };
};
