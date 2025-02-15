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

  const recentVersions = parseRecentVersions(version);

  // If the dependency version does not satisfy the recent version pattern, skip it
  if (!recentVersions) {
    return;
  }

  const versions = (await getDependencyVersions(dependency))
    .map((ver) => parse(ver))
    .filter((semver) => semver && !semver.prerelease.length) as Array<SemVer>;

  const versionsAllowed = getRecentVersions(versions, recentVersions).map(
    (semver) => semver.raw
  );

  // If there are no versions satisfying the recent version pattern, report the error
  if (!versionsAllowed.length) {
    console.log(
      chalk.red(
        `recent: ${dependency}@${dependencyValue.rootVersion} there are no versions satisfying the rule ${version}`
      )
    );
    return;
  }

  // If the dependency from config satisfies the rule, skip
  if (
    dependencyValue.rootVersion &&
    versionsAllowed.includes(dependencyValue.rootVersion)
  ) {
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
