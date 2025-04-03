import type { SemVer } from "semver";
import { parse } from "semver";

import type { Options } from "../index.js";
import {
  RecentRuleViolation,
  RuleViolationLevel,
  stats,
} from "../stats/index.js";
import type { DependencyMap } from "../utils/get-dependency-map.js";
import type { RecentRules } from "../utils/get-depscop-config.js";
import { getRecentVersions } from "../utils/get-recent-versions.js";
import { getPackageVersions } from "../utils/npm/get-package-versions.js";
import { parseRecentVersions } from "../utils/parse-recent-versions.js";

const checkRecentRulesEntry = async (
  dependencyMap: DependencyMap,
  [dependency, [version, reason]]: [string, [string, string]],
  options: Options
): Promise<void> => {
  const dependencyValue = dependencyMap.get(dependency);

  // If the dependency from config is not installed, skip it
  if (!dependencyValue) {
    return;
  }

  const recentVersionSegments = parseRecentVersions(version);

  // If the dependency version does not satisfy the recent version pattern, skip it
  if (!recentVersionSegments) {
    return;
  }

  const versions = (await getPackageVersions(dependency))
    .map((ver) => parse(ver))
    // TODO: Make an option for prerelease versions handling
    .filter((semver) => semver && !semver.prerelease.length) as Array<SemVer>;

  const versionsAllowed = getRecentVersions(
    versions,
    recentVersionSegments
  ).map((semver) => semver.raw);

  // If there are no versions satisfying the recent version pattern, report the error
  if (!versionsAllowed.length) {
    stats.addRuleViolation(
      new RecentRuleViolation(
        `${dependency}@${dependencyValue.rootVersion} there are no versions satisfying the rule ${version}`
      )
    );
    return;
  }

  const indexOfRootVersion = dependencyValue.rootVersion
    ? versionsAllowed.indexOf(dependencyValue.rootVersion)
    : -1;
  const isVersionAllowed = indexOfRootVersion !== -1;
  const isVersionLatest = indexOfRootVersion === versionsAllowed.length - 1;

  // If the installed dependency satisfies the rule and the latest allowed version is installed, skip it
  if (isVersionLatest) {
    return;
  }

  // If the installed dependency satisfies the rule, but not the latest allowed version is installed, report the warning
  if (isVersionAllowed && !isVersionLatest) {
    if (!options.quiet) {
      stats.addRuleViolation(
        new RecentRuleViolation(
          `${dependency}@${dependencyValue.rootVersion} may be outdated soon`,
          {
            description: `Currently allowed versions: ${versionsAllowed.join(
              ", "
            )}`,
            level: RuleViolationLevel.WARNING,
          }
        )
      );
    }

    return;
  }

  // Report the error
  stats.addRuleViolation(
    new RecentRuleViolation(
      `${dependency}@${dependencyValue.rootVersion} does not satisfy the rule ${version}`,
      {
        description: `Currently allowed versions: ${versionsAllowed.join(
          ", "
        )}`,
        reason,
      }
    )
  );
};

export const recentChecker = async (
  dependencyMap: DependencyMap,
  recentRules: RecentRules,
  options: Options
): Promise<void> => {
  await Promise.all(
    Object.entries(recentRules).map((recentRulesEntry) =>
      checkRecentRulesEntry(dependencyMap, recentRulesEntry, options)
    )
  );
};
