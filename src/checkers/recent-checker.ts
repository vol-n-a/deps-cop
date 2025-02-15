import chalk from "chalk";
import type { SemVer } from "semver";
import { parse } from "semver";

import type { DependencyMap } from "../utils/get-dependency-map";
import { getDependencyVersions } from "../utils/get-dependency-versions";
import type { RecentRules } from "../utils/get-depscop-config";
import { getRecentVersions } from "../utils/get-recent-versions";
import { parseRecentVersions } from "../utils/parse-recent-versions";

const checkRecentRulesEntry = async (
  dependencyMap: DependencyMap,
  [dependency, [version, reason]]: [string, [string, string]]
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

  const versions = (await getDependencyVersions(dependency))
    .map((ver) => parse(ver))
    // TODO: Make an option for prerelease versions handling
    .filter((semver) => semver && !semver.prerelease.length) as Array<SemVer>;

  const versionsAllowed = getRecentVersions(
    versions,
    recentVersionSegments
  ).map((semver) => semver.raw);

  // If there are no versions satisfying the recent version pattern, report the error
  if (!versionsAllowed.length) {
    console.log(
      chalk.red(
        `recent: ${dependency}@${dependencyValue.rootVersion} there are no versions satisfying the rule ${version}`
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
    console.log(
      chalk.yellow(
        `recent: ${dependency}@${
          dependencyValue.rootVersion
        } may be outdated soon\n\tCurrently allowed versions: ${versionsAllowed.join(
          ", "
        )}`
      )
    );
    return;
  }

  // Report the error
  console.log(
    chalk.red(
      `recent: ${dependency}@${
        dependencyValue.rootVersion
      } does not satisfy the rule ${version}\n\tCurrently allowed versions: ${versionsAllowed.join(
        ", "
      )}\n\tReason: ${chalk.italic(reason)}`
    )
  );
};

export const recentChecker = async (
  dependencyMap: DependencyMap,
  recentRules: RecentRules
): Promise<void> => {
  await Promise.all(
    Object.entries(recentRules).map((recentRulesEntry) =>
      checkRecentRulesEntry(dependencyMap, recentRulesEntry)
    )
  );
};
