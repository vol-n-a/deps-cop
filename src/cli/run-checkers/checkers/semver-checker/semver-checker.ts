import { satisfies } from "semver";

import type {
  DependencyName,
  SemverRule,
  SemverRuleset,
} from "src/config/index.js";
import { Severity } from "src/config/index.js";

import type { CliOptions } from "../../../model/index.js";
import { stats } from "../../../stats/index.js";
import type { DependenciesInstalled } from "../../utils/index.js";
import { isArrayOfArrays } from "../utils/index.js";
import { SemverRuleViolation } from "./model/index.js";

const checkSemverRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependencyName: DependencyName,
  [version, reason, ruleOptions]: SemverRule,
  cliOptions: CliOptions
): void => {
  const dependencyVersion = dependenciesInstalled.get(dependencyName);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && cliOptions.quiet) {
    return;
  }

  // If the dependency from config is not installed, skip it
  if (!dependencyVersion) {
    return;
  }

  // If the installed dependency satisfies the rule, skip
  if (dependencyVersion && satisfies(dependencyVersion, version)) {
    return;
  }

  // Report the error
  stats.addRuleViolation(
    new SemverRuleViolation(
      `${dependencyName}@${dependencyVersion} does not satisfy ${dependencyName}@${version}`,
      {
        reason,
        severity: ruleOptions?.severity,
      }
    )
  );
};

export const semverChecker = (
  dependenciesInstalled: DependenciesInstalled,
  semverRuleset: SemverRuleset,
  cliOptions: CliOptions
): void => {
  Object.entries(semverRuleset).forEach(([dependency, ruleSet]) => {
    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkSemverRule(dependenciesInstalled, dependency, rule, cliOptions);
      });

      return;
    }

    checkSemverRule(dependenciesInstalled, dependency, ruleSet, cliOptions);
  });
};
