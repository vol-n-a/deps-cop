import type { SemVer } from "semver";
import { parse, validRange } from "semver";

import type {
  DependencyName,
  RecentRule,
  RecentRuleset,
} from "src/config/index.js";
import { Severity } from "src/config/index.js";

import { stats } from "../../../stats/index.js";
import type { DependenciesInstalled } from "../../utils/index.js";
import { isArrayOfArrays } from "../utils/index.js";
import type { CheckRecentRuleOptions } from "./model/index.js";
import { RecentRuleViolation } from "./model/index.js";
import { getPackageVersions, getRecentVersions } from "./utils/index.js";

const checkRecentRule = async (
  dependenciesInstalled: DependenciesInstalled,
  dependencyName: DependencyName,
  [version, reason, ruleOptions]: RecentRule,
  options: CheckRecentRuleOptions
): Promise<void> => {
  // If required version is a valid semver range, throw an error
  if (validRange(version)) {
    throw new Error(
      `Semver ranges like "${version}" are not supported in Recent ruleset. Use Allowed ruleset ("allowed" field in depscop config) instead for semver range constraints.`
    );
  }

  const dependencyVersion = dependenciesInstalled.get(dependencyName);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && options.quiet) {
    return;
  }

  // If the dependency from config is not installed, skip it
  if (!dependencyVersion) {
    return;
  }

  const shouldIncludePrerelease =
    ruleOptions?.prerelease || options.allowPrerelease;
  const versions = (await getPackageVersions(dependencyName))
    .map((ver) => parse(ver))
    .filter(
      (semver) =>
        semver && (shouldIncludePrerelease || !semver.prerelease.length)
    ) as Array<SemVer>;

  const versionsAllowed = getRecentVersions(versions, version).map(
    (semver) => semver.raw
  );

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
  if (!options.quiet && isVersionAllowed && !isVersionLatest) {
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

export const checkRecentRules = async (
  dependenciesInstalled: DependenciesInstalled,
  recentRuleset: RecentRuleset,
  options: CheckRecentRuleOptions
): Promise<void> => {
  await Promise.all(
    Object.entries(recentRuleset).flatMap((recentRulesEntry) => {
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
