import type { SemVer } from "semver";

import { groupBy } from "./group-by.js";
import type { RecentVersionSegments } from "./parse-recent-versions.js";

type SemVerIteratee = (
  value: SemVer
) => SemVer["major"] | SemVer["minor"] | SemVer["patch"];

const majorVersionPredicate: SemVerIteratee = (version) => version.major;
const minorVersionPredicate: SemVerIteratee = (version) => version.minor;
const patchVersionPredicate: SemVerIteratee = (version) => version.patch;

/**
 * Creates an object composed of keys generated from the results of running each element of `versions` array through `iteratee`.
 * The corresponding value of each key is an array of the elements responsible for generating the key
 *
 * The result of `iteratee` must be a number representing a major, minor or patch version
 *
 * Then the function picks keys based on the `recentsValue` argument's sign and value and returns corresponding values of picked keys:
 * - `recentValue < 0`: picks `recentValue` the largest keys
 * - `recentValue >= 0`: picks the `key === recentValue`. If there is no such key, the result is an empty object
 *
 * @param versions Array of versions to iterate over
 * @param recentValue The number that determines which object keys to pick based on its sign
 * @param iteratee The function invoked per iteration
 * @returns The composed aggregate object of versions
 */
const groupVersions = (
  versions: Array<SemVer>,
  recentValue: number,
  iteratee: SemVerIteratee
): Record<string, Array<SemVer>> => {
  const versionsGrouped = groupBy(versions, iteratee);

  if (recentValue < 0) {
    return Object.fromEntries(
      Object.entries(versionsGrouped)
        .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
        .slice(recentValue)
    );
  }

  if (!versionsGrouped[recentValue]) {
    return {};
  }

  return { [recentValue]: versionsGrouped[recentValue] };
};

/**
 * Generates a subset of versions from the given array based on the `recentMajors`, `recentMinors` and `recentPatches` version segments specified
 * - If the `recentMajors`, `recentMinors` or `recentPatches` version segment is negative, the function picks the most recent versions of the corresponding segment
 * - If the `recentMajors`, `recentMinors` or `recentPatches` version segment is non-negative, the function picks versions that match that segment
 *
 * Positive and negative version segments can be combined
 *
 * @example
 * const versions = ["1.1.0", "1.1.1", "1.2.0", "1.2.1", "1.2.2", "1.2.3"];
 * const recentVersions = { recentMajors: -1, recentMinors: -1, recentPatches: -1 };
 * console.log(pickRecentVersions(versions, recentVersions)); // Output: ["1.2.3"]
 *
 * @example
 * const versions = ["1.1.0", "1.1.1", "1.2.0", "1.2.1", "1.2.2", "1.2.3"];
 * const recentVersions = { recentMajors: -1, recentMinors: -2, recentPatches: -2 };
 * console.log(pickRecentVersions(versions, recentVersions)); // Output: ["1.1.0", "1.1.1", "1.2.2", "1.2.3"]
 *
 * @example
 * const versions = ["1.1.0", "1.1.1", "1.2.0", "1.2.1", "1.2.2", "1.2.3"];
 * const recentVersions = { recentMajors: -1, recentMinors: 1, recentPatches: -2 };
 * console.log(pickRecentVersions(versions, recentVersions)); // Output: ["1.1.0", "1.1.1"]
 *
 * @param versions An array of version strings in the format major.minor.patch (e.g., `1.2.3`).
 * @param recentVersions An object containing the `recentMajors`, `recentMinors` and `recentPatches` version numbers
 * @returns An array of version strings that meet the criteria based on the recentVersions input.
 *
 */
export const getRecentVersions = (
  versions: Array<SemVer>,
  { recentMajors, recentMinors, recentPatches }: RecentVersionSegments
): Array<SemVer> => {
  const recentMajorVersions = groupVersions(
    versions,
    recentMajors,
    majorVersionPredicate
  );

  if (recentMinors === undefined) {
    return Object.values(recentMajorVersions).flat();
  }

  const res: Array<Array<Array<SemVer>>> = [];
  for (const key in recentMajorVersions) {
    if (!Object.prototype.hasOwnProperty.call(recentMajorVersions, key)) {
      continue;
    }

    const majors = recentMajorVersions[key];

    const recentMinorVersions = groupVersions(
      majors,
      recentMinors,
      minorVersionPredicate
    );

    if (recentPatches === undefined) {
      res.push(Object.values(recentMinorVersions));
      continue;
    }

    for (const innerKey in recentMinorVersions) {
      if (
        !Object.prototype.hasOwnProperty.call(recentMinorVersions, innerKey)
      ) {
        continue;
      }

      const minors = recentMinorVersions[innerKey];

      const recentPatchVersions = groupVersions(
        minors,
        recentPatches,
        patchVersionPredicate
      );

      res.push(Object.values(recentPatchVersions));
    }
  }

  return res.flat().flat();
};
