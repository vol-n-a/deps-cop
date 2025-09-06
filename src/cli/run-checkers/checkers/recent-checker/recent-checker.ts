import type { SemVer } from "semver";
import { parse } from "semver";

import type {
  DependencyName,
  RecentRule,
  RecentRuleset,
} from "src/config/index.js";
import { Severity } from "src/config/index.js";

import type { CliOptions } from "../../../model/index.js";
import { stats } from "../../../stats/index.js";
import type { DependenciesInstalled } from "../../utils/index.js";
import { isArrayOfArrays } from "../utils/index.js";
import { RecentRuleViolation } from "./model/recent-rule-violation.js";
import {
  getPackageVersions,
  getRecentVersions,
  parseRecentVersions,
} from "./utils/index.js";

const checkRecentRule = async (
  dependenciesInstalled: DependenciesInstalled,
  dependencyName: DependencyName,
  [version, reason, ruleOptions]: RecentRule,
  cliOptions: CliOptions
): Promise<void> => {
  const dependencyVersion = dependenciesInstalled.get(dependencyName);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && cliOptions.quiet) {
    return;
  }

  // If the dependency from config is not installed, skip it
  if (!dependencyVersion) {
    return;
  }

  const recentVersionSegments = parseRecentVersions(version);

  const shouldIncludePrerelease =
    ruleOptions?.prerelease || cliOptions.allowPrerelease;
  const versions = (await getPackageVersions(dependencyName))
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
        `No versions of ${dependencyName} satisfy the recency version rule "${version}"`,
        {
          severity: ruleOptions?.severity,
        }
      )
    );
    return;
  }

  const indexOfRootVersion = dependencyVersion
    ? versionsAllowed.indexOf(dependencyVersion)
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
        `${dependencyName}@${dependencyVersion} may be outdated soon`,
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
      `${dependencyName}@${dependencyVersion} does not satisfy the recency version rule "${version}"`,
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
