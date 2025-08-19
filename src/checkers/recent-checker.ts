import type { SemVer } from "semver";
import { parse } from "semver";

import type { DependenciesInstalled } from "src/shared/utils/index.js";
import {
  getPackageVersions,
  getRecentVersions,
  isArrayOfArrays,
  parseRecentVersions,
} from "src/shared/utils/index.js";

import type { CliOptions } from "../command.js";
import type {
  DependencyName,
  RecentRule,
  RecentRuleset,
} from "../config/index.js";
import { Severity } from "../config/index.js";
import { RecentRuleViolation, stats } from "../stats/index.js";

const checkRecentRule = async (
  dependenciesInstalled: DependenciesInstalled,
  dependency: DependencyName,
  [version, reason, ruleOptions]: RecentRule,
  cliOptions: CliOptions
): Promise<void> => {
  const dependencyValue = dependenciesInstalled.get(dependency);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && cliOptions.quiet) {
    return;
  }

  // If the dependency from config is not installed, skip it
  if (!dependencyValue) {
    return;
  }

  const recentVersionSegments = parseRecentVersions(version);

  // If the dependency version does not satisfy the recent version pattern, skip it
  if (!recentVersionSegments) {
    return;
  }

  const shouldIncludePrerelease =
    ruleOptions?.prerelease || cliOptions.allowPrerelease;
  const versions = (await getPackageVersions(dependency))
    .map((ver) => parse(ver))
    .filter(
      (semver) =>
        semver && (shouldIncludePrerelease || !semver.prerelease.length)
    ) as Array<SemVer>;

  const versionsAllowed = getRecentVersions(
    versions,
    recentVersionSegments
  ).map((semver) => semver.raw);

  // If there are no versions satisfying the recent version pattern, report the error
  if (!versionsAllowed.length) {
    stats.addRuleViolation(
      new RecentRuleViolation(
        `No versions of ${dependency} satisfy the recency version rule "${version}"`,
        {
          severity: ruleOptions?.severity,
        }
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
  // This is always a warning because the rules are still satisfied, but a newer allowed version is available
  // The severity of this check can not be overridden by rule option "severity"
  if (!cliOptions.quiet && isVersionAllowed && !isVersionLatest) {
    stats.addRuleViolation(
      new RecentRuleViolation(
        `${dependency}@${dependencyValue.rootVersion} may be outdated soon`,
        {
          description: `Available allowed versions: ${versionsAllowed.join(", ")}`,
          severity: Severity.WARNING,
        }
      )
    );

    return;
  }

  // Report the error
  stats.addRuleViolation(
    new RecentRuleViolation(
      `${dependency}@${dependencyValue.rootVersion} does not satisfy the recency version rule "${version}"`,
      {
        description: `Available allowed versions: ${versionsAllowed.join(", ")}`,
        reason,
        severity: ruleOptions?.severity,
      }
    )
  );
};

export const recentChecker = async (
  dependenciesInstalled: DependenciesInstalled,
  recentRuleset: RecentRuleset,
  cliOptions: CliOptions
): Promise<void> => {
  await Promise.all(
    Object.entries(recentRuleset).flatMap((recentRulesEntry) => {
      const [dependency, ruleSet] = recentRulesEntry;

      if (isArrayOfArrays(ruleSet)) {
        return ruleSet.map((rule) =>
          checkRecentRule(dependenciesInstalled, dependency, rule, cliOptions)
        );
      }

      return checkRecentRule(
        dependenciesInstalled,
        dependency,
        ruleSet,
        cliOptions
      );
    })
  );
};
