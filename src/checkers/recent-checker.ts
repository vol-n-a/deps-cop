import type { SemVer } from "semver";
import { parse } from "semver";

import type { Options } from "../command.js";
import {
  RecentRuleViolation,
  RuleViolationLevel,
  stats,
} from "../stats/index.js";
import type { DependenciesInstalled } from "../utils/get-dependencies-installed.js";
import type {
  DependencyName,
  RecentRules,
  Rule,
} from "../utils/get-depscop-config.js";
import { getRecentVersions } from "../utils/get-recent-versions.js";
import { getPackageVersions } from "../utils/npm/get-package-versions.js";
import { parseRecentVersions } from "../utils/parse-recent-versions.js";
import { isArrayOfArrays } from "../utils/type-guards/is-array-of-arrays.js";

const checkRecentRule = async (
  dependenciesInstalled: DependenciesInstalled,
  dependency: DependencyName,
  [version, reason]: Rule,
  options: Options
): Promise<void> => {
  const dependencyValue = dependenciesInstalled.get(dependency);

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
    .filter(
      (semver) =>
        semver && (options.allowPrerelease || !semver.prerelease.length)
    ) as Array<SemVer>;

  const versionsAllowed = getRecentVersions(
    versions,
    recentVersionSegments
  ).map((semver) => semver.raw);

  // If there are no versions satisfying the recent version pattern, report the error
  if (!versionsAllowed.length) {
    stats.addRuleViolation(
      new RecentRuleViolation(
        `No versions of ${dependency} satisfy the recency version rule "${version}"`
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
            description: `Available allowed versions: ${versionsAllowed.join(", ")}`,
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
      `${dependency}@${dependencyValue.rootVersion} does not satisfy the recency version rule "${version}"`,
      {
        description: `Available allowed versions: ${versionsAllowed.join(", ")}`,
        reason,
      }
    )
  );
};

export const recentChecker = async (
  dependenciesInstalled: DependenciesInstalled,
  recentRules: RecentRules,
  options: Options
): Promise<void> => {
  await Promise.all(
    Object.entries(recentRules).flatMap((recentRulesEntry) => {
      const [dependency, ruleSet] = recentRulesEntry;

      if (isArrayOfArrays(ruleSet)) {
        return ruleSet.map((rule) =>
          checkRecentRule(dependenciesInstalled, dependency, rule, options)
        );
      }

      return checkRecentRule(
        dependenciesInstalled,
        dependency,
        ruleSet,
        options
      );
    })
  );
};
